// src/hooks/useSwipeNavigation.js
import { useSwipeable } from "react-swipeable";
import { useNavigate } from "react-router-dom";

const useSwipeNavigation = (pages, currentPath) => {
  const navigate = useNavigate();
  const currentIndex = pages.indexOf(currentPath);
  
  return useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex !== -1 && currentIndex < pages.length - 1) {
        navigate(pages[currentIndex + 1]);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        navigate(pages[currentIndex - 1]);
      }
    },
    delta: 10,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });
};

export default useSwipeNavigation;
