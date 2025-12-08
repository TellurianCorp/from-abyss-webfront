import { useEffect, useState, useMemo } from 'react'
import './WeatherShader.css'

type WeatherType = 'snow' | 'rain' | 'fog' | 'deadmoon' | 'dying-red'

interface ParticleStyle {
  left: string
  animationDelay: string
  animationDuration: string
  top?: string
}

export function WeatherShader() {
  const [weatherType, setWeatherType] = useState<WeatherType>('snow')

  useEffect(() => {
    // Escolhe aleatoriamente entre neve, chuva, névoa, deadmoon rising e avermelhado morrendo
    const types: WeatherType[] = ['snow', 'rain', 'fog', 'deadmoon', 'dying-red']
    const randomType = types[Math.floor(Math.random() * types.length)]
    setWeatherType(randomType)
  }, [])

  // Generate snowflake styles once
  const snowflakeStyles = useMemo<ParticleStyle[]>(() => {
    return Array.from({ length: 30 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 5}s`
    }))
  }, [])

  // Generate raindrop styles once
  const raindropStyles = useMemo<ParticleStyle[]>(() => {
    return Array.from({ length: 60 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 1.5}s`,
      animationDuration: `${0.3 + Math.random() * 0.7}s`
    }))
  }, [])

  // Generate dying particle styles once
  const dyingParticleStyles = useMemo<ParticleStyle[]>(() => {
    return Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${4 + Math.random() * 4}s`
    }))
  }, [])

  return (
    <div className={`weather-shader weather-shader-${weatherType}`}>
      {weatherType === 'snow' && (
        <>
          {snowflakeStyles.map((style, i) => (
            <div key={i} className="snowflake" style={style} />
          ))}
        </>
      )}
      {weatherType === 'rain' && (
        <>
          {raindropStyles.map((style, i) => (
            <div key={i} className="raindrop" style={style} />
          ))}
        </>
      )}
      {weatherType === 'fog' && (
        <>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="fog-layer" style={{
              animationDelay: `${i * 2}s`,
              animationDuration: `${15 + i * 5}s`
            }} />
          ))}
        </>
      )}
      {weatherType === 'deadmoon' && (
        <>
          <div className="deadmoon" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="deadmoon-particle" style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`
            }} />
          ))}
        </>
      )}
      {weatherType === 'dying-red' && (
        <>
          {dyingParticleStyles.map((style, i) => (
            <div key={i} className="dying-particle" style={style} />
          ))}
        </>
      )}
    </div>
  )
}
