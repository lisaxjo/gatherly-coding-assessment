const namespace = "SidebarVideochat";

export const MY_ATTENDEE_ID = `${namespace}__MY_ATTENDEE_ID`;

const LocalStore = {
  getValue(key, fallback) {
    try {
      const rawValue = localStorage.getItem(key) || fallback;
      return rawValue;
    } catch (error) {
      console.error("Failed to retrieve value for", key, error);
      return fallback;
    }
  },
  setValue(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error("Failed to set value for", key);
    }
  },
  clearValue(key) {
    try {
      localStorage.clearValue(key);
    } catch (error) {
      console.error("Failed to clear value for", key);
    }
  },
};

export default LocalStore;
