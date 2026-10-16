import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // const unsubscribe = onAuthStateChanged(auth, currentUser => {
    //   setUser(currentUser);
    // });

    // return () => unsubscribe();
  }, []);

  const login = async () => {
    // await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    // await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);