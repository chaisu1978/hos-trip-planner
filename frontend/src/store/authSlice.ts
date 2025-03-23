import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getUserDetails } from "../services/auth";
import { setTheme } from "./themeSlice"; // Import setTheme action


interface User {
  email: string | null;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  profile_picture?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  timezone?: string;
  preferred_units?: string;
  theme_mode?: string; // dark or light
  is_superuser?: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

const initialState: AuthState = {
  isAuthenticated: !!localStorage.getItem("accessToken"),
  user: null,
};

// Fetch user details and apply theme setting
export const fetchUserData = createAsyncThunk("auth/fetchUserData", async (_, { dispatch }) => {
  const user = await getUserDetails();

  // Set the theme based on user's preference
  if (user.theme_mode) {
    dispatch(setTheme(user.theme_mode === "dark"));
  }

  return user;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<User>) {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.clear();
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUserData.fulfilled, (state, action) => {
      state.user = action.payload;
    });
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;
