import React, { Component } from "react";
import {
  API_URL,
  API_KEY,
  IMAGE_BASE_URL,
  POSTER_SIZE,
  BACKDROP_SIZE
} from "../../config";
import HeroImage from "../elements/HeroImage/HeroImage";
import SearchBar from "../elements/SearchBar/SearchBar";
import FourColGrid from "../elements/FourColGrid/FourColGrid";
import MovieThumb from "../elements/MovieThumb/MovieThumb";
import LoadMoreButton from "../elements/LoadMoreBtn/LoadMoreBtn";
import Spinner from "../elements/Spinner/Spinner";
import "./Home.css";

class Home extends Component {
  state = {
    movies: [],
    heroImage: null,
    loading: false,
    currentPage: 0,
    totalPages: 0,
    searchTerm: ""
  };

  componentDidMount() {
    if (localStorage.getItem("HomeState")) {
      const state = JSON.parse(localStorage.getItem("HomeState"));
      this.setState({
        ...state
      });
    } else {
      this.setState({ loading: true });
      const endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&languaje=en-US&page=1`;
      this.fetchItems(endpoint);
    }
  }

  loadMoreItems = () => {
    let endpoint = "";
    this.setState({ loading: true });
    if (this.state.searchTerm === "") {
      endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&languaje=en-US&page=${this
        .state.currentPage + 1}`;
    } else {
      endpoint = `${API_URL}search/movie?api_key=${API_KEY}&languaje=en-US&query=${
        this.state.searchTerm
      }&page=${this.state.currentPage + 1}`;
    }
    console.log(endpoint);
    this.fetchItems(endpoint);
  };

  searchItems = searchTerm => {
    console.log(searchTerm);
    let endpoint = "";
    this.setState({
      movies: [],
      loading: true,
      searchTerm
    });
    if (searchTerm === "") {
      endpoint = `${API_URL}movie/popular?api_key=${API_KEY}&languaje=en-US&page=${this
        .state.currentPage + 1}`;
      console.log("if");
    } else {
      endpoint = `${API_URL}search/movie?api_key=${API_KEY}&languaje=en-US&query=${searchTerm}`;
      console.log("else");
    }
    this.fetchItems(endpoint);
  };

  fetchItems = endpoint => {
    console.log(endpoint);
    fetch(endpoint)
      .then(result => result.json())
      .catch(function(e) {
        console.log(e); // "oh, no!"
      })
      .then(result => {
        console.log(result.results);
        console.log(this.state.movies);
        let movies = [...this.state.movies, ...result.results];
        this.setState(
          {
            movies,
            heroImage:
              this.state.heroImage ||
              result.results[Math.floor(Math.random() * result.results.length)],
            loading: false,
            currentPage: result.page,
            totalPages: result.total_pages
          },
          () => {
            if(this.state.searchTerm === ''){
              localStorage.setItem("HomeState", JSON.stringify(this.state));
            }
          }
        );
      });
  };

  render() {
    //ES6 destructuring the state
    const {movies,heroImage,loading,currentPage,totalPages,searchTerm}=this.state;
    return (
      <div className="rmdb-home">
        {heroImage ? (
          <div>
            <HeroImage
              image={`${IMAGE_BASE_URL}${BACKDROP_SIZE}${heroImage.backdrop_path}`}
              title={heroImage.original_title}
              text={heroImage.overview}
            />
          </div>
        ) : null}
        <SearchBar callback={this.searchItems} />
        <div className="rmdb-home-grid">
          <FourColGrid
            header={searchTerm ? "Search Result" : "Popular Movies"}
            loading={loading}
          >
            {movies.map((e, i) => {
              return (
                <MovieThumb
                  key={i}
                  clickeable={true}
                  image={
                    e.poster_path
                      ? `${IMAGE_BASE_URL}${BACKDROP_SIZE}${e.poster_path}`
                      : "./images/no_image.jpg"
                  }
                  movieId={e.id}
                  movieName={e.original_title}
                />
              );
            })}
          </FourColGrid>
          {loading ? <Spinner /> : null}
          {currentPage <= this.state.totalPages &&
          !loading ? (
            <LoadMoreButton text="Load More" onClick={this.loadMoreItems} />
          ) : null}
        </div>
      </div>
    );
  }
}

export default Home;
