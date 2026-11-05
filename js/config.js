/**
 * Global Configuration for CHACHER (CHCR) Biodata QR System
 * Loads credentials dynamically from .env and localStorage.
 */
const APP_CONFIG = {
  // 1. GitHub Repository Configuration (Loaded from .env / localStorage / string fallback)
  githubUsername: localStorage.getItem("biodata_github_username") || "adityapandapersonal",
  githubRepo: localStorage.getItem("biodata_github_repo") || "running_room_biodata_chacher",
  branch: localStorage.getItem("biodata_github_branch") || "main",

  // Token is stored securely in browser's localStorage and never committed to Git
  defaultGithubToken: localStorage.getItem("biodata_github_pat") || "",

  // 2. Dynamic Admin Authentication (Credentials loaded from .env / localStorage)
  adminAuth: {
    enabled: true,
    get username() {
      return localStorage.getItem("biodata_admin_username") || (window.__ENV__ && window.__ENV__.ADMIN_USERNAME) || "aditya";
    },
    set username(val) {
      if (val) localStorage.setItem("biodata_admin_username", val);
    },
    get password() {
      return localStorage.getItem("biodata_admin_password") || (window.__ENV__ && window.__ENV__.ADMIN_PASSWORD) || "panda1234";
    },
    set password(val) {
      if (val) localStorage.setItem("biodata_admin_password", val);
    },
    sessionKey: "biodata_admin_authenticated"
  },

  // Local storage key for storing admin token
  tokenStorageKey: "biodata_github_pat",

  // Base URL for QR codes pointing to GitHub Pages public profile URL
  getBaseUrl: function () {
    const isLocal = window.location.hostname === "localhost" || 
                    window.location.hostname === "127.0.0.1" || 
                    window.location.protocol === "file:";
    if (isLocal) {
      const path = window.location.pathname.substring(0, window.location.pathname.lastIndexOf("/") + 1);
      return `${window.location.origin}${path}index.html`;
    }
    return `https://${this.githubUsername}.github.io/${this.githubRepo}/index.html`;
  },

  // Runtime .env Loader
  loadEnv: async function () {
    try {
      const res = await fetch(".env?t=" + Date.now());
      if (!res.ok) return;
      const text = await res.text();
      const env = {};
      text.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx !== -1) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
          env[k] = v;
        }
      });
      window.__ENV__ = env;
      if (env.GITHUB_TOKEN) {
        this.defaultGithubToken = env.GITHUB_TOKEN;
        localStorage.setItem(this.tokenStorageKey, env.GITHUB_TOKEN);
      }
      if (env.GITHUB_USERNAME) {
        this.githubUsername = env.GITHUB_USERNAME;
        localStorage.setItem("biodata_github_username", env.GITHUB_USERNAME);
      }
      if (env.GITHUB_REPO) {
        this.githubRepo = env.GITHUB_REPO;
        localStorage.setItem("biodata_github_repo", env.GITHUB_REPO);
      }
      if (env.GITHUB_BRANCH) {
        this.branch = env.GITHUB_BRANCH;
        localStorage.setItem("biodata_github_branch", env.GITHUB_BRANCH);
      }
      if (env.ADMIN_USERNAME) {
        localStorage.setItem("biodata_admin_username", env.ADMIN_USERNAME);
      }
      if (env.ADMIN_PASSWORD) {
        localStorage.setItem("biodata_admin_password", env.ADMIN_PASSWORD);
      }
    } catch (_) {}
  }
};

// Auto-trigger .env load
APP_CONFIG.loadEnv();

window.APP_CONFIG = APP_CONFIG;
