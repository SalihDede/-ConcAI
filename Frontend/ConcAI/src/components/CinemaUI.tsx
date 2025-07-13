export const CinemaUI = () => {
  return (
    <>
      <div className="ui-overlay">
        <h3>🎭 ConcAI - 3D Cinema Hall</h3>
        <p><strong>Controls:</strong></p>
        <p>• Mouse movement: Turn your head (within natural limits)</p>
        <p>• Click: Enable mouse lock</p>
        <p>• ESC: Disable mouse lock</p>
        <p>• S key: Open seat selection screen</p>
        <br />
        <p><em>You are sitting in your selected seat.</em></p>
        <p><em>Explore the cinema hall and the environment!</em></p>
      </div>
      <div className="crosshair" />
    </>
  )
}
