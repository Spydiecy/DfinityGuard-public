import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Text "mo:base/Text";

actor UserManagement {

    type User = {
        id: Principal;
        username: Text;
        firstName: Text;
        lastName: Text;
        email: Text;
        passwordHash: Text;
    };

    private stable var usersEntries : [(Text, User)] = [];
    private var userMap = HashMap.HashMap<Text, User>(1, Text.equal, Text.hash);
    private var emailToUsername = HashMap.HashMap<Text, Text>(1, Text.equal, Text.hash);

    public shared(msg) func registerUser(username: Text, firstName: Text, lastName: Text, email: Text, password: Text) : async Result.Result<(), Text> {
        switch (userMap.get(username)) {
            case (?_) {
                #err("Username already exists")
            };
            case (null) {
                let newUser : User = {
                    id = msg.caller;
                    username = username;
                    firstName = firstName;
                    lastName = lastName;
                    email = email;
                    passwordHash = password; // In a real-world scenario, hash this password
                };
                userMap.put(username, newUser);
                emailToUsername.put(email, username);
                #ok()
            };
        }
    };

    public query func getUser(username: Text) : async Result.Result<User, Text> {
        switch (userMap.get(username)) {
            case (?user) {
                #ok(user)
            };
            case (null) {
                #err("User not found")
            };
        }
    };

    public shared(msg) func updateUser(username: Text, firstName: Text, lastName: Text, email: Text) : async Result.Result<(), Text> {
        switch (userMap.get(username)) {
            case (?user) {
                if (user.id == msg.caller) {
                    let updatedUser : User = {
                        id = user.id;
                        username = username;
                        firstName = firstName;
                        lastName = lastName;
                        email = email;
                        passwordHash = user.passwordHash;
                    };
                    userMap.put(username, updatedUser);
             
                }
            };
            case (null) {
                #err("User not found")
            };
        }
    };

    system func preupgrade() {
        usersEntries := Iter.toArray(userMap.entries());
    };

    system func postupgrade() {
        userMap := HashMap.fromIter<Text, User>(usersEntries.vals(), 1, Text.equal, Text.hash);
        usersEntries := [];
        for ((username, user) in userMap.entries()) {
            emailToUsername.put(user.email, username);
        };
    };
}
