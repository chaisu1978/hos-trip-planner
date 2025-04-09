import { useDispatch, useSelector } from "react-redux";
import { Switch } from "@mui/material";
import { toggleTheme } from "../../store/themeSlice";
import { RootState } from "../../store";
import { FaMoon, FaSun } from "react-icons/fa";

const ThemeToggle = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const handleToggleTheme = () => {
    dispatch(toggleTheme()); // Directly update the Redux state
  };

  return (
    <Switch
      checked={isDarkMode}
      onChange={handleToggleTheme}
      name="themeToggle"
      size="medium"
      color="default"
      checkedIcon={<FaMoon size={20} />}
      icon={<FaSun size={20} />}
    />
  );
};

export default ThemeToggle;
