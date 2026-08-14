import { useState, useEffect } from 'react';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import AppRouter from './app/Router';
import Login from './components/Login';
import { dataService } from './services/dataService';
import { StorehouseProvider } from './context/StorehouseContext';
export default function App() {
  const [loggedIn, setLoggedIn] = useState(dataService.isLoggedIn());

  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setLoggedIn(dataService.isLoggedIn());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <StorehouseProvider>
      {!loggedIn ? (
        <Login onLoginSuccess={() => {
          window.location.hash = '#/';
          setLoggedIn(true);
        }} />
      ) : (
        <AppRouter />
      )}
    </StorehouseProvider>
  );
}
