import React, { useEffect, useState, ChangeEvent, FormEvent} from 'react';
import './style.css';
import logo from '../../assets/logo.svg';

import { FiArrowLeft } from 'react-icons/fi';

import { Link, useHistory } from 'react-router-dom';

import { Map, TileLayer, Marker } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'

import api from '../../services/api';

import axios from 'axios';

// useState(função_para executar, [quando este elemento variar] );//!!
// quando criamos estado de array e objeto, precisamos informar manualmento o tipo da variável!!
// usando interface


const CreatePoint = ()=>{

    const history = useHistory();

    //API IBGE 
    // GET UF's -> https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy={uf.any}
    // GET Munícipios da UF -> https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/distritos

    //States da aplicação-------------------------------------------------------------------------
    
    const [selectedUf, setSelectedUf] = useState<string>('0');

    const [selectedCity, setSelectedCity] = useState<string>('0');
    
    const [userLocation, setUserLocation] = useState<[number, number]>([0,0])
    
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>(userLocation)

    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const defaultInputValues = {
        name:'',
        email:'',
        whatsapp:''
    }

    const [inputData, setInputData] = useState(defaultInputValues);

    //onChange Inputs!!
    function changeInput(event: ChangeEvent<HTMLInputElement>){
        const inputName = event.target.name;
        const inputValue = event.target.value;

        //Spread operator ...object -> pega todos os valores do objeto!!!
        setInputData({
             ...inputData,
              [inputName]:inputValue 
        });
        console.log(inputData);

    }



    //onChange Select de UF
    function changeUf(event: ChangeEvent<HTMLSelectElement>){
        setSelectedUf(event.target.value);
    }
    
    //onChange Select City
    function changeCity(event: ChangeEvent<HTMLSelectElement>){
        setSelectedCity(event.target.value);
        console.log(selectedCity);
    }

    //Evento click no Map
    function mapClick(event: LeafletMouseEvent){
        let latitude = event.latlng.lat;
        let longitude = event.latlng.lng;

        setSelectedPosition([latitude, longitude])//setando o estado da posição no mapa para o evento do click
        console.log(selectedPosition);
    }

    //Evento click na LI de ítens
    function clickItem(id:number){

        const alreadySelected = selectedItems.findIndex(item =>{//retorna se o ítem estiver selecionado ou não
            return item === id;
        })
        if(alreadySelected >= 0){//método findIndex retorna a posição de um item cujo id === à um ítem
            
            const filteredItems = selectedItems.filter(item =>{
                return item !== id;//retorna todos ítens cujo id !== do id passado pelo evento
            })
            setSelectedItems(filteredItems);

        }else{
            //caso não encontre um index com o id passado, ele inclui no array de ítens selecionados
            setSelectedItems( [...selectedItems, id] );
        }

        
    }


    // Buscando localização do usuário para colocar na prop center!!!

    function searchLocation(){
        navigator.geolocation.getCurrentPosition((location)=>{
            let lat = location.coords.latitude;
            let lng = location.coords.longitude;    
            setUserLocation([lat,lng]);
            //caso o usuário não permita a geolocalização - default location - São Paulo
            if(userLocation[0] === 0 && userLocation[1] === 0){
                userLocation[0] = -23.58412603264412;
                userLocation[1] = -46.59301757812501;
            }
        });
    }

    useEffect(searchLocation, [userLocation]);

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

        const cidade = axios.get<City[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos?orderBy=nome`)
        .then(response =>{
            const cidade = response.data.map( city =>{
                return city
            });
            setCities(cidade);
            
        });
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
        api.get('items').then( (response) =>{

            setItems(response.data);

        });
    }
    useEffect(getItems, []);//inicia a função quando carregar


    //OnSubmit
    async function dataSubmit(event: FormEvent){
        event.preventDefault();//previni de recarregar onSubmit!

        const { name, email, whatsapp } = inputData;
        const uf = selectedUf;
        const city = selectedCity;
        

        const [latitude, longitude] = selectedPosition;

        const items = selectedItems;

        const data = {
            name, 
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf, 
            items
        }
        
        await api.post('points', data);
        alert('Cadastrado com sucesso');
        

        history.push('/');

    }




    return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form onSubmit={dataSubmit}>
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
                            onChange={changeInput}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="text"
                                name="email"
                                id="email"
                                onChange={changeInput}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={changeInput}
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

                            //Sempre que quiser passar um função que tem parâmetros, sem chamá-la diretamente:
                            // <htmlElement onEvent={()=> funcao(params)}>  !!!!
                            <li 
                                onClick={() => clickItem(item.id)} 
                                className={selectedItems.includes(item.id) ? 'selected' : ''}
                                key={item.id}
                            >

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