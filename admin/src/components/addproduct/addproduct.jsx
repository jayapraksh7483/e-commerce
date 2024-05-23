import React, { useState } from "react";
import './addproduct.css';
import upload_area from '../../assets/upload_area.svg'
const Addproduct = () => {
    const [image, setimage] = useState();
    const [productDetails, setproductDetails] = useState({
        name: "",
        image: "",
        category: "women",
        old_price: "",
        new_price: "",

    })
    const imageHandler = (e) => {
        setimage(e.target.files[0]);
    }
    const changeHandler = (e) => {
        setproductDetails({ ...productDetails, [e.target.name]: e.target.value })
    }
    const Add_Product = async () => {
        console.log(productDetails)
        let responseData;
        let product = productDetails;
        let formData = new FormData();
        formData.append('product', image);
        await fetch('http://localhost:3001/upload', {
            method: "POST",
            headers: {
                accept: 'application/json',
            },
            body: formData,

        }).then((res) => res.json()).then((data) => {
            responseData = data
        })

        if (responseData.success) {
            product.image = responseData.image_url;

            console.log(product);


            await fetch('http://localhost:3001/addproduct', {
                method: "POST",
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json'  ,
                },
                body:JSON.stringify(product),
            }).then((res) => res.json()).then((data) => {
                data.success?alert("Product Added"):alert("Failed");
            });
            
          
             
            



        }

    }
    return (
        <div className="add-product">
            <div className="addproduct-itemfield">
                <p>Product title</p>
                <input value={productDetails.name} type="text" name="name" placeholder="Type here" onChange={changeHandler} />
            </div>

            <div className="addproduct-price">
                <div className="addproduct-itemfield">
                    <p>Price</p>
                    <input value={productDetails.old_price} type="text" name="old_price" placeholder="Type here" onChange={changeHandler} />
                </div>
                <div className="addproduct-itemfield">
                    <p> Offer Price</p>
                    <input value={productDetails.new_price} type="text" name="new_price" placeholder="Type here" onChange={changeHandler} />
                </div>
            </div>
            <div className="addproduct-itemfield">
                <p>Product category</p>
                <select value={productDetails.category} name="category" className="add-product-selector" onChange={changeHandler}>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kid">Kid</option>
                </select>


            </div>
            <div className="addproduct-itemfield">

                <label htmlFor="file-input">
                    <img src={image ? URL.createObjectURL(image) : upload_area} className="addproduct-thumbail-img" alt="" />
                </label>
                <input onChange={imageHandler} type="file" name="image" id="file-input" hidden />
            </div>
            <button onClick={() => { Add_Product() }} className="addproduct-btn">ADD</button>

        </div>
    )

}
export default Addproduct