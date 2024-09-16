import Array "mo:base/Array";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Time "mo:base/Time";

act
    private var photos = HashMap.HashMap<PhotoId, Photo>(1, Nat.equal, natHash);
    private var userPhotos = HashMap.HashMap<UserId, [PhotoId]>(1, Principal.equal, Principal.hash);
    private var userStorageUsage = HashMap.HashMap<UserId, Nat>(1, Principal.equal, Principal.hash);

    let MAX_STORAGE_PER_USER : Nat = 100 * 1024 * 1024; // 100 MB in bytes

    public shared(msg) func uploadPhoto(name: Text, contentType: Text, data: Blob) : async Result.Result<PhotoId, Text> {
        let caller = msg.caller;
        let photoSize = data.size();
        let currentUsage = Option.get(userStorageUsage.get(caller), 0);

        if (currentUsage + photoSize > MAX_STORAGE_PER_USER) {
            return #err("Storage limit exceeded");
        };

        let photoId = nextPhotoId;
        nextPhotoId += 1;

        let newPhoto : Photo = {
            id = photoId;
            name = name;
            contentType = contentType;
            data = data;
            owner = caller;
            createdAt = Time.now();
        };

        photos.put(photoId, newPhoto);
        
        switch (userPhotos.get(caller)) {
            case (null) { userPhotos.put(caller, [photoId]); };
            case (?existingPhotos) {
                userPhotos.put(caller, Array.append(existingPhotos, [photoId]));
            };
        };

        userStorageUsage.put(caller, currentUsage + photoSize);

        #ok(photoId)
    };

    public shared(msg) func deletePhoto(photoId: PhotoId) : async Result.Result<(), Text> {
        switch (photos.get(photoId)) {
            case (?photo) {
                if (photo.owner == msg.caller) {
                    photos.delete(photoId);
                    switch (userPhotos.get(msg.caller)) {
                        case (?userPhotoIds) {
                            let updatedUserPhotos = Array.filter(userPhotoIds, func (id: PhotoId) : Bool { id != photoId });
                            userPhotos.put(msg.caller, updatedUserPhotos);
                        };
                        case (null) {};
                    };
                    let currentUsage = Option.get(userStorageUsage.get(msg.caller), 0);
                    userStorageUsage.put(msg.caller, currentUsage - photo.data.size());
                    #ok()
                } else {
                    #err("Access denied")
                }
            };
            case (null) { #err("Photo not found") };
        }
    };

    public query(msg) func getPhoto(photoId: PhotoId) : async Result.Result<Photo, Text> {
        switch (photos.get(photoId)) {
            case (?photo) {
                if (photo.owner == msg.caller) {
                    #ok(photo)
                } else {
                    #err("Access denied")
                }
            };
            case (null) { #err("Photo not found") };
        }
    };

    public query(msg) func getUserPhotos() : async [Photo] {
        switch (userPhotos.get(msg.caller)) {
            case (?photoIds) {
                Array.mapFilter(photoIds, func (id: PhotoId) : ?Photo { photos.get(id) })
            };
            case (null) { [] };
        }
    };

    public query(msg) func getUserStorageUsage() : async Nat {
        Option.get(userStorageUsage.get(msg.caller), 0)
    };

    system func preupgrade() {
        photosEntries := Iter.toArray(photos.entries());
    };

    system func postupgrade() {
        photos := HashMap.fromIter<PhotoId, Photo>(photosEntries.vals(), 1, Nat.equal, natHash);
        photosEntries := [];

        for ((photoId, photo) in photos.entries()) {
            switch (userPhotos.get(photo.owner)) {
                case (null) { userPhotos.put(photo.owner, [photoId]); };
                case (?existingPhotos) {
                    let alreadyExists = Option.isSome(Array.find(existingPhotos, func (id: PhotoId) : Bool { id == photoId }));
                    if (not alreadyExists) {
                        userPhotos.put(photo.owner, Array.append(existingPhotos, [photoId]));
                    };
                };
            };
            let currentUsage = Option.get(userStorageUsage.get(photo.owner), 0);
            userStorageUsage.put(photo.owner, currentUsage + photo.data.size());
        };
    };
}
