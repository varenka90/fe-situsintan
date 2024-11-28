import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import axiosInstance from '../utils/axios';
import configUrl from '../configUrl';
import SidebarDashboard from '../components/SidebarDashboard';
import Swal from 'sweetalert2'; // Import SweetAlert2

const Dashboard = () => {
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Pagination state
  const articlesPerPage = 10; // Articles per page

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

  const handleEdit = (articleId) => {
    navigate(`/edit-article/${articleId}`);
  };

  const handleDelete = async (articleId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${configUrl.beBaseUrl}/api/articles/${articleId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setArticles(articles.filter((article) => article.id !== articleId));
          Swal.fire('Deleted!', 'Your article has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting article:', error.response?.data || error.message);
          Swal.fire('Error!', 'There was an error deleting the article.', 'error');
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your article is safe :)', 'error');
      }
    });
  };

  const handleSetHeadline = async (articleId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
    try {
      await axiosInstance.post(`/articles/${articleId}/set-headline`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedArticles = articles.map((article) =>
        article.id === articleId ? { ...article, slider: 1 } : article
      );
      setArticles(updatedArticles);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error setting headline:', error.response?.data || error.message);
    }
  };

  const handleUnsetHeadline = async (articleId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
    try {
      await axiosInstance.post(`/articles/${articleId}/unset-headline`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const updatedArticles = articles.map((article) =>
        article.id === articleId ? { ...article, slider: 0 } : article
      );
      setArticles(updatedArticles);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error unsetting headline:', error.response?.data || error.message);
    }
  };

  // Pagination logic
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ display: 'flex' }}>
      <SidebarDashboard />
      <div className="dashboard">
        <h1>Dashboard Artikel</h1>
        <table>
          <thead>
            <tr>
              <th>NO</th>
              <th>TITLE</th>
              <th>DATE</th>
              <th>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentArticles.map((article, index) => (
              <tr key={article.id}>
                <td className="index">{index + 1 + (currentPage - 1) * articlesPerPage}</td>
                <td>{article.title}</td>
                <td>{`Pada: ${new Date(article.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`}</td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(article.id)}>Ubah</button>
                    <button className="delete-btn" onClick={() => handleDelete(article.id)}>Hapus</button>
                    {article.slider ? (
                      <button className="unheadline-btn" onClick={() => handleUnsetHeadline(article.id)}>
                        Un-Set as Headline
                      </button>
                    ) : (
                      <button className="headline-btn" onClick={() => handleSetHeadline(article.id)}>
                        Set as Headline
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          articlesPerPage={articlesPerPage}
          totalArticles={articles.length}
          paginate={paginate}
          currentPage={currentPage}
        />
      </div>
    </div>
  );
};

// Pagination component
const Pagination = ({ articlesPerPage, totalArticles, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalArticles / articlesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <div className="pagination">
        {pageNumbers.map(number => (
          <span key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button onClick={() => paginate(number)} className="page-link">
              {number}
            </button>
          </span>
        ))}
      </div>
    </nav>
  );
};

export default Dashboard;
