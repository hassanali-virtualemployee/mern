import React, { useEffect, useState } from "react";

import UsersList from "../components/UsersList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const Users = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(); //initially undefined
  const [loadedUsers, setLoadedUsers] = useState(); //initially undefined

  //useEffect hook is allows us to run certain code only when certain dependecies change
  //the code runs is defined in the function which is first argument and second argument is an array of dependencies so of data that needs to change which re-run and is this empty it means it will never re-run it will only run once which is exactly we want here
  //don't use async in function which is first argument of useEffect() therefor we add a new const sendRequest in useEffect
  
    useEffect(() => {
      const sendRequest = async () => {
        setIsLoading(true);
        try {
          const response = await fetch("http://localhost:5000/api/users/", {
            method: 'GET'
          });
          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(responseData.message);
          }

          setLoadedUsers(responseData.users);
        } catch (err) {
          console.log(err);
          setError(err.message);
        }
        setIsLoading(false);
      };
      sendRequest();
    }, []);

    const errorHandler = () => {
      setError(null);
    };
    return (
      <React.Fragment>
        <ErrorModal error={error} onClear={errorHandler} />
        {isLoading && (
          <div className="center">
            <LoadingSpinner />
          </div>
        )}
        {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
      </React.Fragment>
    );
};

export default Users;
