import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';

import { Nav } from "react-bootstrap";

import { variables } from '../Variables.js';


function Sidebar() {
  return (
    <>
            {/* Боковая панель на которой хранится ссылки на страницы */}
            <div className="sidebar">
					<ul>
					    <Link to="/viewer">
                            <li>
                                <a href="#">
                                    <p>Dataset loading</p>
                                    <span></span>
                                </a>
                            </li>
                        </Link>
                        <Link to="/graphics">
                            <li>
                                <a href="#">
                                    <i></i>
                                    <p>Graphics</p>
                                    <span></span>
                                </a>
                            </li>
                        </Link>
                        <Link to="/statistic">
                            <li>
                                <a href="#">
                                    <i></i>
                                    <p>Statistics</p>
                                    <span></span>
                                </a>
                            </li>
                        </Link>
						<Link to="/learning">
                            <li>
                                <a href="#">
                                    <i></i>
                                    <p>Machine Learning</p>
                                    <span></span>
                                </a>
                            </li>
                        </Link>
					</ul>
				</div>
    </>
  );
}

export default Sidebar;