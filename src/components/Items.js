/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { logoutAdmin, loginAdmin } from "../actions/index";
import { connect } from "react-redux";
import { openUploadWidget } from "../helpers/CloudinaryService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImages } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import NavBar from "./NavBar";

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
  const [photo, setImage] = useState([]);
  const [state, setStateFor] = useState({
    name: "",
    details: "",
    value: 0,
    stock_amount: 0,
    first_value: 0,
    group: "Organik Müslin Örtüler",
    banner_status: false,
    cargo_price: 0,
    size: ''
  });
  const [ItemList, setItemList] = useState([]);
  const [navState, setNavState] = useState("");

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
          setImage([...photo, ...myArr])
        }
      } else {
        console.log(error);
      }
    })
  }

  const sendItemToAPI = () => {
    axios.post(
      "http://localhost:3001/items",
      {
        item: {
          image: photo,
          details: state.details,
          value: state.value,
          name: state.name,
          group: state.group,
          banner_status: state.banner_status,
          stock_amount: state.stock_amount,
          first_value: state.first_value,
          discount_percentage: state.first_value !== 0 ? (Math.ceil(state.first_value - state.value) * 100 / state.first_value) : 0,
          cargo_price: state.cargo_price,
          size: state.size
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
  .then(() => {
    checkLoginStatus();
    getItems();
    setImage([]);
  })
  .catch((err) => console.log(err));
  };

  const onInputChange = (event) => {
    const { name } = event.target;
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setStateFor((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleChange = (event) => {
    setNavState(event.target.value);
  };

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:3001/items/${id}`, {
        headers: {
          uid: JSON.parse(localStorage.getItem("myAdmin")).myUid,
          client: JSON.parse(localStorage.getItem("myAdmin")).myClient,
          "access-token": JSON.parse(localStorage.getItem("myAdmin"))
            .myAccessToken,
        },
      })
      .then(() => getItems())
      .catch((error) => console.log(error));
  };

  console.log(state.group);
  let idForImages = -1;
  return (
    <div className="text-center">
      <h1>Ürün Ekle</h1>
      <NavBar handleChange={handleChange} value={navState} />
      <form onSubmit={(event) => event.preventDefault()}>
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
        <select
          name="group"
          id="group"
          className="form-control w-50 mx-auto"
          onChange={(event) => onInputChange(event)}
        >
          <option value="Organik Müslin Örtüler">Organik Müslin Örtüler</option>
          <option value="Çift Taraflı Pikeler">Çift Taraflı Pikeler</option>
          <option value="Örgü Kumaş Pikeler">Örgü Kumaş Pikeler</option>
          <option value="Müslin Keseler">Müslin Keseler</option>
          <option value="Triko Battaniyeler">Triko Battaniyeler</option>
          <option value="Müslin Mendil ve Boyunluk">
            Müslin Mendil ve Boyunluk
          </option>
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
        <input
          type="checkbox"
          className="form-control mt-3"
          name="banner_status"
          onChange={(event) => onInputChange(event)}
        />
        <button
          type="submit"
          className="btn btn-success my-3 w-25 mx-auto"
          onClick={sendItemToAPI}
        >
          Yükle
        </button>
      </form>
      <div>
        <h3>Yüklü Ürünler</h3>
        {ItemList.filter((myItem) => myItem.name.indexOf(navState) !== -1).map(
          (element) => {
            console.log(element);
            return (
              <div
                key={element.id}
                className="card w-50 mx-auto shadow-lg my-3 py-3"
              >
                <div className="w-50 mx-auto">
                  <Link to={`items/${element.id}`}>
                    {element.image.map((img) => {
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
                  </Link>
                </div>
                <div className="card-body">
                  <div>{element.name}</div>
                  <div>{element.details}</div>
                  <div>{`Ürünün satış fiyatı ${element.value} ₺`}</div>
                  <div>{element.group}</div>
                  <div>{`Stok adedi ${element.stock_amount}`}</div>
                  <div>{`Üründeki İndirim ${element.discount_percentage} %`}</div>
                  <div>{`Ürünün kargo fiyatı ${element.cargo_price} ₺`}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-danger w-50 mx-auto"
                  onClick={() => handleDelete(element.id)}
                >
                  Ürünü Sil
                </button>
              </div>
            );
          }
        )}
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
