import React, { useState, useEffect } from 'react';
import { task_manager } from '../../../declarations/task_manager';
import { Principal } from '@dfinity/principal';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Task {
  id: bigint;
  title: string;
  description: string;
  status: { todo: null } | { inProgress: null } | { done: null };
  dueDate: [] | [bigint];
  createdAt: bigint;
  updatedAt: bigint;
  owner: Principal;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const fetchedTasks = await task_manager.getUserTasks();
      setTasks(fetchedTasks as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    try {
      let dueDate: [] | [bigint] = [];
      if (newTask.dueDate) {
        const dateValue = new Date(newTask.dueDate).getTime();
        if (!isNaN(dateValue)) {
          dueDate = [BigInt(dateValue * 1000000)];
        }
      }
      
      const result = await task_manager.createTask(newTask.title, newTask.description, dueDate);
      if ('ok' in result) {
        await fetchTasks();
        setNewTask({ title: '', description: '', dueDate: '' });
      } else {
        console.error('Error creating task:', result.err);
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    try {
      const result = await task_manager.updateTask(
        editingTask.id,
        editingTask.title,
        editingTask.description,
        editingTask.status,
        editingTask.dueDate
      );
      if ('ok' in result) {
        await fetchTasks();
        setEditingTask(null);
      } else {
        console.error('Error updating task:', result.err);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId: bigint) => {
    try {
      const result = await task_manager.deleteTask(taskId);
      if ('ok' in result) {
        await fetchTasks();
      } else {
        console.error('Error deleting task:', result.err);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const getStatusString = (status: Task['status']): string => {
    if ('todo' in status) return 'todo';
    if ('inProgress' in status) return 'inProgress';
    if ('done' in status) return 'done';
    return 'unknown';
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    return getStatusString(task.status) === filter;
  });

  const sortedTasks = filteredTasks.sort((a, b) => {
    if (a.dueDate.length > 0 && b.dueDate.length > 0) {
      return Number(a.dueDate[0]) - Number(b.dueDate[0]);
    }
    if (a.dueDate.length > 0) return -1;
    if (b.dueDate.length > 0) return 1;
    return Number(b.createdAt) - Number(a.createdAt);
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-yellow-500 flex items-center">
        <CheckCircleIcon className="h-8 w-8 mr-2 text-yellow-500" />
        Task Manager
      </h2>
      <div className="mb-4">
        <input
          type="text"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          placeholder="Task Title"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <textarea
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          placeholder="Task Description"
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
        />
        <button
          onClick={handleCreateTask}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Task
        </button>
      </div>
      <div className="mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="all">All Tasks</option>
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>
      <ul className="space-y-2">
        {sortedTasks.map((task) => (
          <li key={task.id.toString()} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">{task.title}</h3>
              <div>
                <button
                  onClick={() => setEditingTask(task)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold p-2 rounded mr-2"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold p-2 rounded"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 mt-2">{task.description}</p>
            <div className="flex items-center mt-2">
              <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-400">
                {task.dueDate.length > 0
                  ? new Date(Number(task.dueDate[0]) / 1000000).toLocaleDateString()
                  : 'No due date'}
              </span>
            </div>
            <div className="mt-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                getStatusString(task.status) === 'todo' ? 'bg-yellow-500 text-black' :
                getStatusString(task.status) === 'inProgress' ? 'bg-blue-500 text-white' :
                'bg-green-500 text-white'
              }`}>
                {getStatusString(task.status) === 'todo' ? 'To Do' :
                 getStatusString(task.status) === 'inProgress' ? 'In Progress' :
                 'Done'}
              </span>
            </div>
          </li>
        ))}
      </ul>
      {editingTask && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold text-yellow-500 mb-4">Edit Task</h3>
            <input
              type="text"
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <textarea
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <input
              type="date"
              value={editingTask.dueDate.length > 0 ? new Date(Number(editingTask.dueDate[0]) / 1000000).toISOString().split('T')[0] : ''}
              onChange={(e) => {
                const dateValue = new Date(e.target.value).getTime();
                const newDueDate: [] | [bigint] = !isNaN(dateValue)
                  ? [BigInt(dateValue * 1000000)]
                  : [];
                setEditingTask({ ...editingTask, dueDate: newDueDate });
              }}
              className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
            />
            <select
              value={getStatusString(editingTask.status)}
              onChange={(e) => setEditingTask({ ...editingTask, status: { [e.target.value]: null } as Task['status'] })}
              className="w-full p-2 mb-4 bg-gray-700 text-white rounded"
            >
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="done">Done</option>
            </select>
            <div className="flex justify-end">
              <button
                onClick={() => setEditingTask(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;