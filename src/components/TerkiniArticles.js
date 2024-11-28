import React, { useEffect, useState } from 'react';
import axios from 'axios';
import configUrl from '../configUrl';
import { Link } from 'react-router-dom';
import '../assets/css/style.css';
import Header from './Header';  // Sudah di-import
import Footer from './Footer';  // Sudah di-import

const TerkiniArticles = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 15;

  useEffect(() => {
    axios.get(`${configUrl.beBaseUrl}/api/articles`)
      .then(response => {
        // Filter artikel yang baru saja dibuat dalam 2 hari terakhir
        const currentDate = new Date();
        const filteredArticles = response.data.filter(article => {
          const articleDate = new Date(article.created_at);
          const timeDifference = (currentDate - articleDate) / (1000 * 60 * 60 * 24); // dalam hari
          return timeDifference <= 60;  // Hanya artikel yang dibuat dalam 2 hari terakhir
        });

        // Sortir artikel berdasarkan tanggal (created_at) dari terbaru ke yang lama
        const sortedArticles = filteredArticles.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setArticles(sortedArticles);
      })
      .catch(error => {
        console.error('Error fetching articles:', error);
      });

    axios.get(`${configUrl.beBaseUrl}/api/categories`)
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error('Error fetching categories:', error);
      });

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Tidak ada Category';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `Pada: ${day}-${month}-${year} / ${hours}:${minutes}`;
  };

  // Set artikel pada halaman saat ini
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Render untuk tampilan desktop
  const renderDesktopView = () => (
    <div className="article-terkini-desktop">
      <h1 className="header-ar-terkini-desktop">
        Berita Terkini
        <span className="extra-decor decor-terkini-desktop"></span>
        <span className="extra-decor decor-terkini-desktopi"></span>
      </h1>
      {currentArticles.map(article => (
        <div key={article.id} className="article-card-terkini">
          <div className='body-article-terkini'>
            <div className='article-terkini-image-wrap'>
              <img 
                src={`${configUrl.beBaseUrl}${article.image_url}`} 
                alt={article.title} 
                className="article-terkini-image"
              />
            </div>
            <div className="article-content-terkini">
              <span className='title-article-terkini'>
                <Link to={`/articles/${article.id}/${encodeURIComponent(article.slug)}`} style={{ textTransform: 'capitalize' }}>
                  {article.title}
                </Link>
              </span>
              <span className="article-body-terkini">
                {article.body.substring(0, 100)}...
              </span>
              <div className="article-meta-terkini">
                {formatDate(article.created_at)}
              </div>
            </div>
          </div>
        </div>
      ))}
      {articles.length === 0 && <p>Tidak ada artikel terbaru dalam 60 hari terakhir.</p>}
      <Pagination 
        articlesPerPage={articlesPerPage} 
        totalArticles={articles.length} 
        paginate={paginate} 
        currentPage={currentPage}
      />
    </div>
  );

  // Render untuk tampilan mobile
  const renderMobileView = () => (
    <div className="article-list-mobile2">
        <h1 className="header-ar-terkini">
           Berita Terkini
           <span className="extra-decor decor-terkini"></span>
            <span className="extra-decor decor-terkinii"></span>
        </h1>
      {currentArticles.map(article => (
        <div key={article.id} className="article-terkini-card-mobile">
          <div className="body-article-terkini-mobile">
            <div className="article-image-wrap-terkini-mobile">
              <img 
                src={`${configUrl.beBaseUrl}${article.image_url}`} 
                alt={article.title} 
                className="article-terkini-image-mobile"
              />
            </div>
            <span className="title-article-terkini-mobile">
              <Link to={`/articles/${article.id}/${encodeURIComponent(article.slug)}`}>
                {article.title}
              </Link>
              <div className="article-terkini-date">
                {formatDate(article.created_at)}
              </div>
            </span>
          </div>
        </div>
      ))}
      {articles.length === 0 && <p>Tidak ada artikel terbaru dalam 60 hari terakhir.</p>}
      <Pagination 
        articlesPerPage={articlesPerPage} 
        totalArticles={articles.length} 
        paginate={paginate} 
        currentPage={currentPage}
      />
    </div>
  );
  

  return (
    <>
      <Header />  {/* Tambahkan Header */}
      <div className="content-wrapper">
        {isMobile ? renderMobileView() : renderDesktopView()}
      </div>
      <Footer />  {/* Tambahkan Footer */}
    </>
  );
};

const Pagination = ({ articlesPerPage, totalArticles, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalArticles / articlesPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <div className='pagination'>
        {pageNumbers.map(number => (
          <span key={number} className={`page-item ${currentPage === number ? 'active' : ''}`}>
            <button onClick={() => paginate(number)} className='page-link'>
              {number}
            </button>
          </span>
        ))}
      </div>
    </nav>
  );
};

export default TerkiniArticles;
