import  { useEffect, useState } from 'react';

const useMovementControls = () => {
  const [movement, setMovement] = useState({
    moveForward: false,
    moveBackward: false,
    moveLeft: false,
    moveRight: false,
    jump: false,
    speedUp: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyAction = moveFieldByKey(e.code);
      if (keyAction) {
        setMovement((prev) => ({ ...prev, [keyAction]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyAction = moveFieldByKey(e.code);
      if (keyAction) {
        setMovement((prev) => ({ ...prev, [keyAction]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return movement;
};

const moveFieldByKey = (key: string) => {
  const keys: { [key: string]: string } = {
    KeyW: 'moveForward',
    KeyS: 'moveBackward',
    KeyA: 'moveLeft',
    KeyD: 'moveRight',
    Space: 'jump',
    ShiftLeft: 'speedUp',
  };
  return keys[key];
};

export default useMovementControls;