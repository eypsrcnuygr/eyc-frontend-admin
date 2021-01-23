/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { logoutAdmin, loginAdmin } from "../actions/index";
import { connect } from "react-redux";
import { Widget } from '@uploadcare/react-widget';
import { Link } from 'react-router-dom';

const mapStateToProps = (state) => {
  const {
    email,
    password,
    password_confirmation,
    uid,
    client,
    access_token,
  } = state.createAdminReducer.admin;

  const { isLoggedIn } = state.createAdminReducer;

  return {
    email,
    password,
    password_confirmation,
    isLoggedIn,
    uid,
    client,
    access_token,
  };
};

const mapDispatchToProps = (dispatch) => ({
  loginAdminFromComponent: (admin) => dispatch(loginAdmin(admin)),
  logoutAdminFromComponent: (admin) => dispatch(logoutAdmin(admin)),
});

const Items = (props) => {
  const [photo, setImage] = useState(null);
  const [state, setState] = useState({
    name: "",
    details: "",
    value: 0,
  });
  const [myDiv, setMyDiv] = useState(null);
  const [ItemList, setItemList] = useState([]);

  let responseVar = null;

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
        if (response.data.success && !props.isLoggedIn) {
          props.loginAdminFromComponent({
            admin: {
              email: response.data.data.email,
              password: props.password,
            },
          });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getItems = () => {
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
          setItemList(response.data);
        }
      });
  };

  useEffect(() => {
      getItems();
      checkLoginStatus();
  }, []);

  const handleLogOut = () => {
    axios
      .delete("http://localhost:3001/v1/auth/sign_out", {
        headers: {
          uid: JSON.parse(localStorage.getItem("myAdmin")).myUid,
          client: JSON.parse(localStorage.getItem("myAdmin")).myClient,
          "access-token": JSON.parse(localStorage.getItem("myAdmin"))
            .myAccessToken,
        },
      })
      .then(() => props.logoutAdminFromComponent())
      .then(() => props.history.push("/"))
      .catch((error) => {
        responseVar = error.response.statusText;
        setTimeout(() => {
          alert(responseVar);
        }, 500);
      });
  };

  const sendItemToAPI = () => {
    axios
      .post(
        "http://localhost:3001/items",
        {
          item: {
            image: photo,
            details: state.details,
            value: state.value,
            name: state.name,
          },
        },
        {
          headers: {
            uid: JSON.parse(localStorage.getItem("myAdmin")).myUid,
            client: JSON.parse(localStorage.getItem("myAdmin")).myClient,
            "access-token": JSON.parse(localStorage.getItem("myAdmin"))
              .myAccessToken,
          },
        }
      )
      .then((response) => {
        if (response.status === 201) {
          setMyDiv("Yükleme Başarılı");
          setTimeout(() => {
            setMyDiv(null);
          }, 2000);
        }
      })
      .then(() => {
        checkLoginStatus();
      })
      .catch((error) => {
        responseVar = error.response.statusText;
        setTimeout(() => {
          alert(responseVar);
        }, 500);
      });
  };

  const onImageUpload = (event) => {
    setImage(event.originalUrl);
  };

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <div className="text-center">
      <h1>Ürün Ekle</h1>
      <div>
        <b>{myDiv}</b>
      </div>
      <input
        className="form-control w-50 mx-auto my-2"
        onChange={(event) => onInputChange(event)}
        value={state.name}
        name="name"
        type="text"
        placeholder="Ürünün Adı"
      />
      <input
        className="form-control w-50 mx-auto my-2"
        onChange={(event) => onInputChange(event)}
        value={state.details}
        name="details"
        type="text"
        placeholder="Ürünün Detayları"
      />
      <input
        className="form-control w-50 mx-auto my-2"
        onChange={(event) => onInputChange(event)}
        value={state.value}
        name="value"
        type="Number"
        placeholder="Ürünün Fiyatı"
      />
      <Widget
        publicKey={process.env.REACT_APP_PUBLIC_API_KEY}
        id="file"
        role="uploadcare-uploader"
        onChange={(event) => onImageUpload(event)}
        locale="tr"
      />
      <button
        type="button"
        className="btn btn-success my-3 w-25 mx-auto"
        onClick={sendItemToAPI}
      >
        Yükle
      </button>
      <div>
        <h3>Yüklü Ürünler</h3>
        {ItemList.map((element) => {
          return (
            <div key={element.id} className="card w-50 mx-auto shadow-lg my-3 py-3">
              <div className="w-50 mx-auto">
              <Link to={`items/${element.id}`}><img src={element.image} alt="item" className="card-img-top img-fluid" /></Link>
              </div>
              <div className="card-body">
                <div>{element.name}</div>
              <div>{element.details}</div>
              <div>{element.value}</div>
              </div>
              
            </div>
          );
        })}
      </div>
      <div className="mb-3">
        <button
          type="button"
          className="button btn btn-danger"
          onClick={handleLogOut}
        >
          Çıkış
        </button>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Items);
