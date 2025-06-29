import { reactive } from 'vue';

const store = reactive({
  username: localStorage.getItem('username'),
  server_domain: "http://localhost:3000",

  login(username) {
    localStorage.setItem('username', username);
    this.username = username;
    console.log("login", this.username);
  },

  logout() {
    console.log("logout");
    localStorage.removeItem('username');
    this.username = undefined;
  },

  async checkSession() {
    try {
      const res = await fetch(this.server_domain + '/users/viewed-recipes', { credentials: 'include' });
      if (res.status === 200) {
        // If the session is valid, keep the username
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch {
      this.logout();
      return false;
    }
  }
});

export default store;
