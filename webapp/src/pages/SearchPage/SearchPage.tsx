import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SpotifyTag from "../../components/SpotifyTag";
import ErrorMessage from "../../components/ErrorMessage";
import spotifyApiInstance from "../../spotifyApiInstance";
import { SpotifyArtistProfileResponse } from "../../types";
import "./SearchPage.css";
import ArtistInfo from "../../containers/ArtistInfo";
import ArtistAlbums from "../../containers/ArtistAlbums";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight, faAngleLeft } from "@fortawesome/free-solid-svg-icons";

const SearchPage = () => {
  const { id } = useParams();
  const [isError, setIsError] = useState(false);
  const [numberOfPages, setNumberOfPages] = useState(1);
  const [searchResults, setSearchResults] =
    useState<SpotifyArtistProfileResponse | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);
  const limit = 12;

  const checkIfLastPage = () => {
    if (searchResults) {
      if (pageNumber * limit >= searchResults.totalAlbums) {
        setIsLastPage(true);
      } else {
        setIsLastPage(false);
      }
    }
  };

  const getArtistData = async () => {
    try {
      const response = await spotifyApiInstance.get(
        `api/search/${id}?page=${pageNumber}&limit=${limit}`
      );
      setSearchResults(response.data.searchResult);
      setNumberOfPages(
        Math.ceil(response.data.searchResult.totalAlbums / limit)
      );
      checkIfLastPage();
    } catch (error) {
      setIsError(true);
      console.log(error);
    }
  };

  useEffect(() => {
    getArtistData();
  }, []);

  useEffect(() => {
    checkIfLastPage();
  }, [pageNumber, searchResults]);

  const getNextAlbums = async () => {
    if (!isLastPage) {
      setPageNumber(pageNumber + 1);
      try {
        const response = await spotifyApiInstance.get(
          `api/search/${id}?page=${pageNumber + 1}&limit=${limit}`
        );
        setSearchResults(response.data.searchResult);
      } catch (error) {
        setIsError(true);
        console.log(error);
      }
    }
  };

  const getPreviousAlbums = async () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
      try {
        const response = await spotifyApiInstance.get(
          `api/search/${id}?page=${pageNumber - 1}&limit=${limit}`
        );
        setSearchResults(response.data.searchResult);
      } catch (error) {
        setIsError(true);
        console.log(error);
      }
    }
  };

  return (
    <div className="artistPageContainer">
      {searchResults && (
        <div>
          <div className="artistInfoAndPageNumber">
            <ArtistInfo searchResults={searchResults} />
            <h2 className="pageNumberText">
              Page {pageNumber} of {numberOfPages}
            </h2>
          </div>
          <div className="paginationContainer">
            <FontAwesomeIcon
              icon={faAngleLeft}
              onClick={() => getPreviousAlbums()}
              className={pageNumber === 1 ? "disabled" : "paginationButton"}
            />
            <ArtistAlbums albums={{ albums: searchResults.albums }} />
            <FontAwesomeIcon
              icon={faAngleRight}
              onClick={() => getNextAlbums()}
              className={!isLastPage ? "paginationButton" : "disabled"}
            />
          </div>
        </div>
      )}
      {isError && <ErrorMessage />}
    </div>
  );
};

export default SearchPage;
