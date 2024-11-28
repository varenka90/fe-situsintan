import React, { useState, useEffect } from 'react';
import ChartArticlesPopular from '../components/ChartArticlesPopular';
import SidebarDashboard from '../components/SidebarDashboard'; 
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axios';

const IndexDashboard = () => {
    const [articles, setArticles] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchArticles = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
            } else {
                try {
                    const response = await axiosInstance.get('/articles', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setArticles(response.data);
                } catch (error) {
                    console.error('Error fetching articles:', error.response?.data || error.message);
                }
            }
        };
        fetchArticles();
    }, [navigate]);

    return (
<div className="dashboard-container">
    <SidebarDashboard /> 
    <div className="dashboard-content"> {/* Wrapper untuk konten dashboard */}
        <ChartArticlesPopular />
    </div>
</div>

    );
};

export default IndexDashboard;
