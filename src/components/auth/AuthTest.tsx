import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from '@/config/firebase';

export const AuthTest = () => {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const testSignUp = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setResult(`Successfully created user: ${user.uid}`);
    } catch (error) {
      setError(`Sign-up error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult('');
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setResult(`Successfully signed in user: ${user.uid}`);
    } catch (error) {
      setError(`Sign-in error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <h2 className="text-lg font-semibold mb-4">Firebase Authentication Test</h2>
      
      <div className="mb-4">
        <label className="block mb-1">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-1">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      
      <div className="flex space-x-2 mb-4">
        <button 
          onClick={testSignUp}
          disabled={loading} 
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Test Sign Up
        </button>
        
        <button 
          onClick={testSignIn}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Test Sign In
        </button>
      </div>
      
      {loading && <div className="text-gray-500">Loading...</div>}
      
      {result && (
        <div className="bg-green-100 border-green-300 border p-2 rounded">
          {result}
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border-red-300 border p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};
