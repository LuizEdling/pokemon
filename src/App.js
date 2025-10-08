import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const [pokemonList, setPokemonList] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [backgroundGradient, setBackgroundGradient] = useState('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Carregar lista de todos os Pokémon ao montar o componente
  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const data = await response.json();
        setPokemonList(data.results.map(p => p.name));
      } catch (err) {
        console.error('Erro ao carregar lista de Pokémon:', err);
      }
    };
    
    fetchPokemonList();
  }, []);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPokemon = async (name) => {
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    setShowSuggestions(false);
    
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`);
      
      if (!response.ok) {
        throw new Error('Pokémon não encontrado!');
      }
      
      const data = await response.json();
      setPokemon(data);
      
      // Atualizar cor de fundo baseado no tipo principal do Pokémon
      if (data.types && data.types.length > 0) {
        const primaryType = data.types[0].type.name;
        setBackgroundGradient(getTypeGradient(primaryType));
      }
      
      // Adicionar ao histórico
      if (!searchHistory.includes(name.toLowerCase())) {
        setSearchHistory([name.toLowerCase(), ...searchHistory.slice(0, 9)]);
      }
    } catch (err) {
      setError(err.message);
      setPokemon(null);
      // Resetar para cor padrão em caso de erro
      setBackgroundGradient('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedSuggestionIndex(-1);
    
    if (value.trim().length > 0) {
      const filtered = pokemonList
        .filter(name => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    searchPokemon(suggestion);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[selectedSuggestionIndex]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchPokemon(searchTerm);
  };

  const handleHistoryClick = (name) => {
    setSearchTerm(name);
    searchPokemon(name);
  };

  const getTypeGradient = (type) => {
    const gradients = {
      normal: 'linear-gradient(135deg, #A8A77A 0%, #8F8D65 100%)',
      fire: 'linear-gradient(135deg, #EE8130 0%, #D4681F 100%)',
      water: 'linear-gradient(135deg, #6390F0 0%, #4A78D6 100%)',
      electric: 'linear-gradient(135deg, #F7D02C 0%, #DDB61A 100%)',
      grass: 'linear-gradient(135deg, #7AC74C 0%, #5FA737 100%)',
      ice: 'linear-gradient(135deg, #96D9D6 0%, #7BC0BD 100%)',
      fighting: 'linear-gradient(135deg, #C22E28 0%, #A3241F 100%)',
      poison: 'linear-gradient(135deg, #A33EA1 0%, #873287 100%)',
      ground: 'linear-gradient(135deg, #E2BF65 0%, #C8A450 100%)',
      flying: 'linear-gradient(135deg, #A98FF3 0%, #8B72D9 100%)',
      psychic: 'linear-gradient(135deg, #F95587 0%, #E0396D 100%)',
      bug: 'linear-gradient(135deg, #A6B91A 0%, #8A9B15 100%)',
      rock: 'linear-gradient(135deg, #B6A136 0%, #9A872C 100%)',
      ghost: 'linear-gradient(135deg, #735797 0%, #5D467D 100%)',
      dragon: 'linear-gradient(135deg, #6F35FC 0%, #5620E3 100%)',
      dark: 'linear-gradient(135deg, #705746 0%, #5A4638 100%)',
      steel: 'linear-gradient(135deg, #B7B7CE 0%, #9A9AB5 100%)',
      fairy: 'linear-gradient(135deg, #D685AD 0%, #BD6B94 100%)'
    };
    return gradients[type] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const getTypeColor = (type) => {
    const colors = {
      normal: '#A8A77A',
      fire: '#EE8130',
      water: '#6390F0',
      electric: '#F7D02C',
      grass: '#7AC74C',
      ice: '#96D9D6',
      fighting: '#C22E28',
      poison: '#A33EA1',
      ground: '#E2BF65',
      flying: '#A98FF3',
      psychic: '#F95587',
      bug: '#A6B91A',
      rock: '#B6A136',
      ghost: '#735797',
      dragon: '#6F35FC',
      dark: '#705746',
      steel: '#B7B7CE',
      fairy: '#D685AD'
    };
    return colors[type] || '#777';
  };

  return (
    <div className="App" style={{ background: backgroundGradient }}>
      <div className="container">
        <header className="header">
          <h1 className="title">
            <span className="pokeball-icon">⚡</span>
            PokéDex
            <span className="pokeball-icon">⚡</span>
          </h1>
          <p className="subtitle">Busque seus Pokémon favoritos!</p>
        </header>

        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-container">
            <div className="autocomplete-wrapper">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Digite o nome ou número do Pokémon..."
                className="search-input"
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef} className="suggestions-dropdown">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion}
                      className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      onMouseEnter={() => setSelectedSuggestionIndex(index)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button type="submit" className="search-button" disabled={loading}>
              {loading ? '🔍 Buscando...' : '🔍 Buscar'}
            </button>
          </div>
        </form>

        {searchHistory.length > 0 && (
          <div className="history-container">
            <p className="history-title">Buscas recentes:</p>
            <div className="history-tags">
              {searchHistory.map((name, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(name)}
                  className="history-tag"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">❌</span>
            {error}
          </div>
        )}

        {pokemon && (
          <div className="pokemon-card">
            <div className="pokemon-header">
              <h2 className="pokemon-name">
                {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
              </h2>
              <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
            </div>

            <div className="pokemon-image-container">
              <img
                src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="pokemon-image"
              />
            </div>

            <div className="pokemon-types">
              {pokemon.types.map((type, index) => (
                <span
                  key={index}
                  className="type-badge"
                  style={{ backgroundColor: getTypeColor(type.type.name) }}
                >
                  {type.type.name.toUpperCase()}
                </span>
              ))}
            </div>

            <div className="pokemon-stats">
              <h3 className="stats-title">Estatísticas</h3>
              <div className="stats-grid">
                {pokemon.stats.map((stat, index) => (
                  <div key={index} className="stat-item">
                    <div className="stat-header">
                      <span className="stat-name">
                        {stat.stat.name.replace('-', ' ').toUpperCase()}
                      </span>
                      <span className="stat-value">{stat.base_stat}</span>
                    </div>
                    <div className="stat-bar-container">
                      <div
                        className="stat-bar"
                        style={{ width: `${(stat.base_stat / 255) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pokemon-info">
              <div className="info-item">
                <span className="info-label">Altura:</span>
                <span className="info-value">{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div className="info-item">
                <span className="info-label">Peso:</span>
                <span className="info-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
              <div className="info-item">
                <span className="info-label">Habilidades:</span>
                <span className="info-value">
                  {pokemon.abilities.map(a => a.ability.name).join(', ')}
                </span>
              </div>
            </div>
          </div>
        )}

        {!pokemon && !error && !loading && (
          <div className="welcome-message">
            <div className="welcome-icon">🎮</div>
            <h2>Bem-vindo à PokéDex!</h2>
            <p>Comece buscando um Pokémon pelo nome ou número.</p>
            <div className="suggestions">
              <p>Experimente buscar:</p>
              <div className="suggestion-buttons">
                {['pikachu', 'charizard', 'mewtwo', 'eevee', 'lucario'].map((name) => (
                  <button
                    key={name}
                    onClick={() => {
                      setSearchTerm(name);
                      searchPokemon(name);
                    }}
                    className="suggestion-button"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
