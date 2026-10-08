/**
 * HealthPulse — Prototype Role-Based Authentication Engine
 * File: js/auth.js
 * Description: Client-side prototype authentication, hardcoded credential checking, session storage & logout.
 */

window.HealthPulseAuth = (() => {
  const AUTH_KEY = 'healthpulse_auth_session';

  // Hardcoded Demo Accounts
  const ACCOUNTS = {
    public: {
      username: "vinanti",
      password: "pass@123",
      role: "public",
      redirect: "public/index.html"
    },
    professional: {
      username: "drsharma",
      password: "doctor@123",
      role: "professional",
      redirect: "admin-overview.html"
    }
  };

  function getSession() {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY) || sessionStorage.getItem('codeastra_auth_session');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(sessionData) {
    try {
      sessionStorage.setItem(AUTH_KEY, JSON.stringify(sessionData));
    } catch (e) {}
  }

  function clearSession() {
    try {
      sessionStorage.removeItem(AUTH_KEY);
      sessionStorage.removeItem('codeastra_auth_session');
    } catch (e) {}
  }

  function login(username, password, role) {
    const targetAccount = ACCOUNTS[role];
    if (!targetAccount) {
      return { success: false, message: "Invalid role selected." };
    }

    if (username.trim().toLowerCase() === targetAccount.username.toLowerCase() && password === targetAccount.password) {
      const session = {
        isLoggedIn: true,
        username: targetAccount.username,
        role: targetAccount.role,
        loginTime: new Date().toISOString()
      };
      setSession(session);
      return { success: true, redirect: targetAccount.redirect };
    }

    return { success: false, message: "Invalid username, password, or account type." };
  }

  function logout(relativePrefix = "") {
    clearSession();
    window.location.href = relativePrefix + "index.html";
  }

  function checkAccess(requiredRole, relativePrefix = "") {
    const session = getSession();
    if (!session || !session.isLoggedIn) {
      window.location.href = relativePrefix + "login.html";
      return false;
    }

    if (requiredRole && session.role !== requiredRole) {
      // Redirect to correct portal if wrong role
      if (session.role === 'public') {
        window.location.href = relativePrefix + "public/index.html";
      } else {
        window.location.href = relativePrefix + "admin-overview.html";
      }
      return false;
    }

    return true;
  }

  return {
    getSession,
    login,
    logout,
    checkAccess,
    ACCOUNTS
  };
})();

window.CodeAstraAuth = window.HealthPulseAuth;

