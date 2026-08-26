import { PLATFORM_NETWORKS } from '../config/platform'

export default function PlatformNetworkSwitch({
  value,
  onChange,
}) {
  return (
    <div
      className="platform-network-switch"
      aria-label="Rabbit Platform network"
    >
      {Object.values(PLATFORM_NETWORKS).map((network) => (
        <button
          key={network.key}
          type="button"
          className={value === network.key ? 'active' : ''}
          onClick={() => onChange(network.key)}
        >
          <b>{network.label}</b>
          <small>{network.chainId}</small>
        </button>
      ))}
    </div>
  )
}
