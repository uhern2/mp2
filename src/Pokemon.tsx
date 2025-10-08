import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { colorTypes, capitalize } from './Home'; 
import './Pokemon.css';

export default function Detail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;
    const fetchPokemon = async () => {
      try {
        const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`);
        setPokemon(res.data);
      } catch (err) {
        console.error(err);
        setError("Pokemon not found");
      }
    };
    fetchPokemon();
  }, [name]);

  if (!pokemon) return <p>Loading...</p>;

  const getColor = () => {
    const types = pokemon.types.map((t: any) => t.type.name);
    const color1 = colorTypes[types[0]] || "gray";
    const color2 = types[1] ? colorTypes[types[1]] : color1;
    return { background: `linear-gradient(135deg, ${color1}, ${color2})`, minHeight: "100vh", transition: "background 1s ease" };
  };

  const goPrev = () => navigate(`/pokemon/${pokemon.id - 1}`);
  const goNext = () => navigate(`/pokemon/${pokemon.id + 1}`);

  return (
    <div style={getColor()} className="detail-container">
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
    <button onClick={goPrev}>Prev</button>
    <button onClick={goNext}>Next</button>
    <button onClick={() => navigate('/')}>Back Home</button>
  </div>
</div>
  );
}
