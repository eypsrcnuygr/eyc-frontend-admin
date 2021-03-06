/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { openUploadWidget } from "../helpers/CloudinaryService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { logoutAdmin, loginAdmin } from "../actions/index";
import { connect } from "react-redux";
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

const Item = (props) => {
  const [photo, setImage] = useState([]);
  const [state, setState] = useState({
    name: "",
    details: "",
    value: 0,
    group: 'Organik Müslin Örtüler',
    stock_amount: 0,
    first_value: 0,
    cargo_price: 0,
    size: '',
  });
  const [myDiv, setMyDiv] = useState(null);
  const [Item, setItem] = useState([]);
  let responseVar = null;

  const checkLoginStatus = () => {
    axios
      .get("https://eyc-api.herokuapp.com/v1/auth/validate_token", {
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

  const getItem = () => {
    axios
      .get(`https://eyc-api.herokuapp.com/items/${props.match.params.id}`, {
        headers: {
          uid: JSON.parse(localStorage.getItem("myAdmin")).myUid,
          client: JSON.parse(localStorage.getItem("myAdmin")).myClient,
          "access-token": JSON.parse(localStorage.getItem("myAdmin"))
            .myAccessToken,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          setItem(response.data);
          setImage(response.data.image);
        }
      })
  };

  useEffect(() => {
    getItem();
    checkLoginStatus();
  }, []);

  const beginUpload = tag => {
    const uploadOptions = {
      cloudName: "eypsrcnuygr",
      tags: [tag, 'anImage'],
      uploadPreset: "goiqmtuj"
    };
    const myArr = [];
    openUploadWidget(uploadOptions, (error, photos) => {
      if (!error) {
        console.log(photos);
        if(photos.event === 'success'){
          console.log(photos);        
          myArr.push(photos.info.secure_url)
          setImage([...myArr])
        }
      } else {
        console.log(error);
      }
    })
  }

  const handleLogOut = () => {
    axios
      .delete("https://eyc-api.herokuapp.com/v1/auth/sign_out", {
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
      .patch(
        `https://eyc-api.herokuapp.com/items/${props.match.params.id}`,
        {
          item: {
            image: photo,
            details: state.details,
            value: state.value,
            name: state.name,
            group: state.group,
            stock_amount: state.stock_amount,
            first_value: state.first_value,
            discount_percentage: state.first_value !== 0 ? (Math.ceil(state.first_value - state.value) * 100 / state.first_value) : 0,
            cargo_price: state.cargo_price,
            size: state.size,
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
        if (response.status === 200) {
          setMyDiv("Yükleme Başarılı");
          getItem();
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

  const onInputChange = (event) => {
    const { name, value } = event.target;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  let idForImages = -1;

  return (
    <div className="text-center">
      <h1>Ürünü değiştir</h1>
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
      <p>Satış Fiyatı</p>
      <input
        className="form-control w-50 mx-auto my-2"
        onChange={(event) => onInputChange(event)}
        value={state.value}
        name="value"
        type="Number"
        placeholder="Ürünün Fiyatı"
      />
       <p>İlk Fiyat</p>
         <input
          className="form-control w-50 mx-auto my-2"
          onChange={(event) => onInputChange(event)}
          value={state.first_value}
          name="first_value"
          type="Number"
          placeholder="İlk Fiyat"
        />
      <p>Stok Adedi</p>
      <input
        className="form-control w-50 mx-auto my-2"
        onChange={(event) => onInputChange(event)}
        value={state.stock_amount}
        name="stock_amount"
        type="Number"
        placeholder="Stok Adedi"
      />
      <p>Kargo Ücreti</p>
      <input
        className="form-control w-50 mx-auto my-2"
        onChange={(event) => onInputChange(event)}
        value={state.cargo_price}
        name="cargo_price"
        type="Number"
        placeholder="Kargo Ücreti"
      />
        {state.group === 'Tulum' ? 
              <input
              className="form-control w-50 mx-auto my-2"
              onChange={(event) => onInputChange(event)}
              value={state.size}
              name="size"
              type="text"
              placeholder="Beden"
            /> : null
      }
      <select name="group" id="group" className="form-control w-50 mx-auto" onChange={(event) => onInputChange(event)}>
      <option value="Organik Müslin Örtüler">Organik Müslin Örtüler</option>
        <option value="Çift Taraflı Pikeler">Çift Taraflı Pikeler</option>
        <option value="Örgü Kumaş Pikeler">Örgü Kumaş Pikeler</option>
        <option value="Müslin Keseler">Müslin Keseler</option>
        <option value="Triko Battaniyeler">Triko Battaniyeler</option>
        <option value="Müslin Mendil ve Boyunluk">Müslin Mendil ve Boyunluk</option>
        <option value="İşlevsel Puset Örtüsü">İşlevsel Puset Örtüsü</option>
        <option value="Tulum">Tulum</option>
        <option value="İndirimli Ürünler">İndirimli Ürünler</option>
      </select>
      <div className="buttons fadein">
          <div className="button">
            <label htmlFor="multi">
              <FontAwesomeIcon icon={faImages} color="#6d84b4" size="2x" />
              Çoklu Foto Eklemek İçin
            </label>
            <button
            type="button"
              id="multi"
              onClick={() => beginUpload('image')}
              multiple
            >Fotoğraf yükle</button>
          </div>
        </div>
      <button
        type="button"
        className="btn btn-success my-3 w-25 mx-auto"
        onClick={sendItemToAPI}
      >
        Yükle
      </button>
      <div className="card w-50 mx-auto p-4 shadow-lg mb-4">
      <div className="w-75 mx-auto">
      {photo.map(img => {
        idForImages += 1;
        return (
          <img
            src={img}
            key={idForImages}
            alt="item"
            className="card-img-top img-fluid my-4"
          />
        );
      })}
      </div>
      <div>{Item.name}</div>
      <div>{Item.details}</div>
      <div>{Item.value}</div>
      <div>{Item.group}</div>
      <div>{Item.stock_amount}</div>
      <div>{`${Item.discount_percentage} %`}</div>
      <div>{Item.cargo_price}</div>
      <div>{`Beden ${Item.size}`}</div>
      </div>
      
      
      <div className="mb-3">
        <Link to="/logged_in">
        <button
          type="button"
          className="button btn btn-primary"
        >
          Admin Panele Dön
        </button>
        </Link>
        
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

export default connect(mapStateToProps, mapDispatchToProps)(Item);
