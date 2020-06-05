import React, { useEffect, useState, ChangeEvent } from 'react';
import './style.css';
import logo from '../../assets/logo.svg';

import { FiArrowLeft } from 'react-icons/fi';

import { Link } from 'react-router-dom';

import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'

import api from '../../services/api';

import axios from 'axios';

// useState(função_para executar, [quando este elemento variar] );//!!
// quando criamos estado de array e objeto, precisamos informar manualmento o tipo da variável!!
// usando interface


const CreatePoint = ()=>{

    //API IBGE 
    // GET UF's -> https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy={uf.any}
    // GET Munícipios da UF -> https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/distritos

    //States da aplicação-------------------------------------------------------------------------
    
    const [selectedUf, setSelectedUf] = useState<string>('0');

    const [selectedCity, setSelectedCity] = useState<string>('0');
    
    const [userLocation, setUserLocation] = useState<[number, number]>([0,0])
    
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>(userLocation)



    //onChange Select de UF
    function changeUf(event: ChangeEvent<HTMLSelectElement>){
        setSelectedUf(event.target.value);
    }
    
    //onChange Select City
    function changeCity(event: ChangeEvent<HTMLSelectElement>){
        setSelectedCity(event.target.value);
    }

    //Evento click no Map
    function mapClick(event: LeafletMouseEvent){
        let latitude = event.latlng.lat;
        let longitude = event.latlng.lng;

        setSelectedPosition([latitude, longitude])//setando o estado da posição no mapa para o evento do click
    }


    // Buscando localização do usuário para colocar na prop center!!!

    

    function searchLocation(){
        navigator.geolocation.getCurrentPosition((location)=>{
            let lat = location.coords.latitude;
            let lng = location.coords.longitude;
            setUserLocation([lat,lng]);

        });
    }

    useEffect(searchLocation, []);

    // GET UFS-----------------------------------------------------------------------------
    interface UF{
        sigla:string;
    }
    
    const [ufs, setUfs] = useState<string[]>([]);

    function getUfs(){
        // a função axios.get retorna array um tipo UF - <UF[]>
        axios.get<UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then( response =>{
            
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }

    useEffect(getUfs, []);

    // GET CITIES-----------------------------------------------------------------------------

    interface City{
        nome:string;
        id:number;
    }

    const [cities, setCities] = useState<City[]>([]);

    function getCities(){
        // GET CITIES - ocorre quando o estado de selectedUf muda
        if(selectedUf === '0') {
            return;//se o valor de uf for 0, ele não faz a pesquisa com o get
        }

        axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos`).then(response =>{
            const res = response.data.map(city=>{
            return city;
            //como a interface City define o retorno/tipo, o response.data só busca o nome e id!
        });

            setCities(res);
        })
    }    

    useEffect(getCities,[selectedUf]);//Quando o estado selectedUf mudar, eu chamo a função getCities!



    //GET Items -------------------------------------------------------------------
    interface Item{
        id:number;
        title:string;
        image_url:string
    }

    const [items, setItems] = useState<Item[]>([]);//lista de array do tipo Item

    function getItems(){
        api.get('items').then((response) =>{

            setItems(response.data);

        });
    }
    useEffect(getItems, []);//inicia a função quando carregar





    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form action="">
                <h1>Cadastro do <br/> ponto de Coleta </h1>


                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="text"
                                name="email"
                                id="email"
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                    {/* Leaflet lib */}
                    <Map center={userLocation} zoom={15} onClick={mapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition}/>
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select name="uf" id="uf" onChange={changeUf} value={selectedUf} >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf =>(
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select name="city" id="city" onChange={changeCity} value={selectedCity}>
                                <option value="0">Selecione uma Cidade</option>
                                {cities.map(city=>(
                                    <option key={city.id} value={city.nome}>
                                         {city.nome} 
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Itens de coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item =>(//JSX sempre vai por volta de Parênteses
                            <li key={item.id}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar ponto de coleta</button>
            </form>
        </div>
    );
}
export default CreatePoint;