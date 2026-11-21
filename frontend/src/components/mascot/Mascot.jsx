import MascotScene from './MascotScene.jsx';

function Mascot({
  size = 'medium',
  interactive = true,
  animated = true,
  className = '',
}) {
  return (
    <MascotScene
      size={size}
      interactive={interactive}
      animated={animated}
      className={className}
    />
  );
}

export default Mascot;