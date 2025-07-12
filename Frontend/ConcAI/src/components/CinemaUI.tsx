export const CinemaUI = () => {
  return (
    <>
      <div className="ui-overlay">
        <h3>🎭 ConcAI - 3D Sinema Salonu</h3>
        <p><strong>Kontroller:</strong></p>
        <p>• Fare hareketi: Kafa çevirme (doğal limitler dahilinde)</p>
        <p>• Tıklama: Fare kilidini aktifleştir</p>
        <p>• ESC: Fare kilidini kapat</p>
        <p>• S tuşu: Koltuk seçim ekranını aç</p>
        <br />
        <p><em>Seçtiğiniz koltukta oturuyorsunuz.</em></p>
        <p><em>Sinema salonunu ve çevreyi inceleyin!</em></p>
      </div>
      <div className="crosshair" />
    </>
  )
}
