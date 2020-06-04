import React from 'react';

import './style.css';
import logo from '../../assets/logo.svg';

import { FiLogIn } from 'react-icons/fi';

import { Link } from 'react-router-dom';

interface receivedProps{
    teste?:string
}

var Home:React.FC<receivedProps> = ()=>{
    return(
        <div id="page-home">
            <div className="content">
                <header>
                    <img src={logo} alt="EColeta"/>
                </header>
                <main>
                    <h1>Seu marketplace de coleta de resíduos</h1>
                    <p>Ajudamos as pessoas a encontrarem pontos de coleta de forma eficiente</p>

                    <Link to="/create-point">{/*Componente que tem a mesma função do <a>, mas não recarrega toda a aplicação para acessar a rota*/}
                        <span>
                            <FiLogIn/>
                        </span>
                        <strong>Cadastre um ponto de Coleta</strong>
                    </Link>
                </main>
            </div>
        </div>
        
    );
}
export default Home;