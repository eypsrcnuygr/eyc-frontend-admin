/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect } from "react";
const Items = () => {
  let ItemList = null;
  let isCancelled = false;

  const checkLoginStatus = () => {
    axios
      .get("http://localhost:3001/v1/auth/validate_token", {
        headers: {
          uid: JSON.parse(localStorage.getItem("myAdmin")).myUid,
          client: JSON.parse(localStorage.getItem("myAdmin")).myClient,
          "access-token": JSON.parse(localStorage.getItem("myAdmin"))
            .myAccessToken,
        },
      })
      .then((response) => {
        console.log(response);
        axios
          .get("http://localhost:3001/items", {
            headers: {
              uid: JSON.parse(localStorage.getItem("myAdmin")).myUid,
              client: JSON.parse(localStorage.getItem("myAdmin")).myClient,
              "access-token": JSON.parse(localStorage.getItem("myAdmin"))
                .myAccessToken,
            },
          })
          .then((response) => {
            if (response.status === 200) {
              ItemList = response;
              console.log(ItemList);
              isCancelled = true;
            }
            return ItemList;
          })
          .catch((error) => {
            console.log(error);
          });
      });
  };

  useEffect(() => {
    if (!isCancelled) {
      checkLoginStatus();
    }
  }, []);

  return <div>Sercan</div>;
};

export default Items;
