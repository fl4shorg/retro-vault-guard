const VaultBackground = () => (
  <div className="fixed inset-0 vault-gradient-bg -z-10">
    {/* Grid pattern */}
    <div 
      className="absolute inset-0 opacity-[0.03]"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--vault-yellow)) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--vault-yellow)) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }}
    />
    {/* Hazard stripes top */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-40" />
    {/* Floating orbs */}
    <div 
      className="absolute w-[700px] h-[700px] rounded-full opacity-[0.04]"
      style={{
        background: 'radial-gradient(circle, hsl(var(--vault-blue)), transparent 70%)',
        top: '10%',
        left: '-5%',
        animation: 'float-bg 25s ease-in-out infinite',
      }}
    />
    <div 
      className="absolute w-[500px] h-[500px] rounded-full opacity-[0.03]"
      style={{
        background: 'radial-gradient(circle, hsl(var(--vault-yellow)), transparent 70%)',
        bottom: '5%',
        right: '-5%',
        animation: 'float-bg 20s ease-in-out infinite reverse',
      }}
    />
  </div>
);

export default VaultBackground;
