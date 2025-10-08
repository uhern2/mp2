import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

export const colorTypes: { [key: string]: string } = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
};

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

function Home() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [pokemon] = useState<any>(null);
  const [error] = useState('');
  const [allPokemon, setAllPokemon] = useState<any[]>([]);
  const [dropdown, setDropdown] = useState<any[]>([]);
  const [, setSelectedType] = useState<string | null>(null);
  const [gallery, setGallery] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [listSortProperty, setListSortProperty] = useState<'name' | 'id'>('name');
  const [listSortOrder, setListSortOrder] = useState<'asc' | 'desc'>('asc');

  const getColor = () => {
    if (!pokemon)
      return { transition: "background 1s ease", minHeight: "100vh", background: "gainsboro" };
    const types = pokemon.types.map((t: any) => t.type.name);
    const color1 = colorTypes[types[0]] || "gray";
    const color2 = types[1] ? colorTypes[types[1]] : color1;
    return { background: `linear-gradient(135deg, ${color1}, ${color2})`, minHeight: "100vh", transition: "background 1s ease" };
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=2000');
        setAllPokemon(res.data.results);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAll();
  }, []);

  useEffect(() => {
    if (query === '') {
      setDropdown([]);
    } else {
      const filtered = allPokemon.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
      setDropdown(filtered);
    }
  }, [query, allPokemon]);

  const handleTypeClick = async (type: string) => {
    setSelectedType(type);
    setLoading(true);
    try {
      const res = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
      const pokemonList = res.data.pokemon.slice(0, 50);
      const details = await Promise.all(
        pokemonList.map(async (p: any) => {
          const pokeRes = await axios.get(p.pokemon.url);
          return pokeRes.data;
        })
      );
      setGallery(details);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const sortedAllPokemon = [...allPokemon].sort((a, b) => {
    if (listSortProperty === 'name') {
      return listSortOrder === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      const idA = Number(a.url.split('/').slice(-2, -1)[0]);
      const idB = Number(b.url.split('/').slice(-2, -1)[0]);
      return listSortOrder === 'asc' ? idA - idB : idB - idA;
    }
  });

  return (
    <div className="App" style={getColor()}>
      <h1>Search For Your Favorite Pokemon!</h1>
      <div className="search-container">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter Pokémon name or ID"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="search-button"
          onClick={() => { if (query.trim() === '') return; navigate(`/pokemon/${query}`); }}
        >
          Search
        </button>

        {dropdown.length > 0 && (
          <ul className="dropdown">
            {dropdown.map((p, i) => (
              <li key={i} onClick={() => navigate(`/pokemon/${p.name}`)}>
                {p.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <header className="App-header">
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {pokemon && (
          <div className="pokemon-info">
            <h2>{capitalize(pokemon.name)}</h2>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <p>Height: {pokemon.height}</p>
            <p>Weight: {pokemon.weight}</p>
            <p>Types: {pokemon.types.map((t: any) => capitalize(t.type.name)).join(', ')}</p>
          </div>
        )}

        <div className="type-buttons">
          {Object.keys(colorTypes).map(type => (
            <button key={type} onClick={() => handleTypeClick(type)}>
              {capitalize(type)}
            </button>
          ))}
        </div>

        <div className="gallery">
          {loading && <p>Loading...</p>}
          {!loading && gallery.map(p => (
            <div
              key={p.id}
              className="gallery-item"
              onClick={() => navigate(`/pokemon/${p.name}`)}
            >
              <img src={p.sprites.front_default} alt={p.name} />
              <p>{capitalize(p.name)}</p>
              <p className="types">{p.types.map((t: any) => capitalize(t.type.name)).join(', ')}</p>
            </div>
          ))}
        </div>

        <div className="type-buttons">
          <label>Sort Pokémon List by: </label>
          <select
            value={listSortProperty}
            onChange={(e) => setListSortProperty(e.target.value as 'name' | 'id')}
          >
            <option value="name">Name</option>
            <option value="id">ID</option>
          </select>
          <button onClick={() => setListSortOrder(listSortOrder === 'asc' ? 'desc' : 'asc')}>
            {listSortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </button>
        </div>

        <div className="pokemon-list">
          {sortedAllPokemon.map((p, i) => {
            const id = Number(p.url.split('/').slice(-2, -1)[0]);
            return (
              <div
                key={i}
                className="pokemon-list-item"
                onClick={() => navigate(`/pokemon/${p.name}`)}
              >
                #{id} - {capitalize(p.name)}
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default Home;
