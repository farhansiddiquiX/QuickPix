import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ImageSearch.css';
import { FiSearch } from 'react-icons/fi';

const IMAGES_PER_PAGE = 30;
const DEFAULT_QUERY = 'food';
const APP_SLUG = 'QUICKPIX';

const ImageSearch = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState(DEFAULT_QUERY);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // pulled from env (in Vercel: UNSPLASH_KEY)
  const API_KEY = process.env.REACT_APP_UNSPLASH_KEY || process.env.UNSPLASH_KEY;

  // 1. remove clear from searchImages
  const searchImages = e => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    setSearchQuery(inputQuery);
    setPage(1);
    setImages([]);
    fetchImages(1, inputQuery);
    // no more setInputQuery here
  };

  // 2. clear the “food” default once on mount
  useEffect(() => {
    fetchImages(1, DEFAULT_QUERY).finally(() => {
      setInputQuery('');
    });
  }, []);

  const fetchImages = async (pageNum, q) => {
    setLoading(true);
    setError('');

    const url =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(q)}` +
      `&page=${pageNum}` +
      `&per_page=${IMAGES_PER_PAGE}` +
      `&client_id=${API_KEY}` +
      `&utm_source=${APP_SLUG}` +
      `&utm_medium=referral`;

    try {
      const { data } = await axios.get(url);
      setImages(prev =>
        pageNum === 1 ? data.results : [...prev, ...data.results]
      );
      setHasMore(data.results.length === IMAGES_PER_PAGE);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreImages = () => {
    const next = page + 1;
    setPage(next);
    fetchImages(next, searchQuery);
  };

  const downloadImage = async url => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download error', err);
    }
  };

  return (
    <div className='container'>
      <span className='logo'>
        <img src='/images/logo.png' alt='Logo' />
      </span>

      <div className='search'>
        <h2>
          Your free source for breathtaking photos,<br />
          shared with love by creators.
        </h2>

        <form onSubmit={searchImages} className='search-form'>
          <input
            type='text'
            placeholder=' Search for images...'
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
          />
          <button type='submit' disabled={loading}>
            <FiSearch size={24} color='#555' />
          </button>
        </form>
      </div>

      {error && <p className='error'>{error}</p>}

      <div className='image-grid'>
        {images.map(img => (
          <div key={img.id} className='image-card'>
            <img
              src={img.urls.small}
              alt={img.alt_description || 'Unsplash image'}
            />

            {/* Attribution */}
            <div className='attribution'>
              Photo by{' '}
              <a
                href={`${img.user.links.html}?utm_source=${APP_SLUG}&utm_medium=referral`}
                target='_blank'
                rel='noopener noreferrer'
              >
                {img.user.name}
              </a>{' '}
              on{' '}
              <a
                href={`https://unsplash.com/?utm_source=${APP_SLUG}&utm_medium=referral`}
                target='_blank'
                rel='noopener noreferrer'
              >
                Unsplash
              </a>
            </div>

            <button onClick={() => downloadImage(img.urls.full)}>
              Download
            </button>
          </div>
        ))}
      </div>

      {hasMore && !loading && (
        <button className='load-more' onClick={loadMoreImages}>
          Load More
        </button>
      )}
    </div>
  );
};

export default ImageSearch;
