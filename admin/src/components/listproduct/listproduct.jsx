import React, { useState, useEffect } from "react";
import './listproduct.css';
import cross_icon from '../../assets/cross_icon.png'
const Listproduct = () => {
    const [allproducts, setallproducts] = useState([]);
    const fetchinfo = async () => {
        await fetch('http://localhost:3001/allproducts').then((res) => res.json()).then((data) => { setallproducts(data) })
    }
    useEffect(() => {
        fetchinfo()
    }, [])


    const remove_product = async (id) => {
        await fetch('http://localhost:3001/removeproduct', {
            method: "POST",
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: id }),
        });

        await fetchinfo();
    };


    return (
        <div className="list-product">
            <h1>All Products List</h1>
            <div className="l">
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>

            <div className="listproduct-allproducts">
                <hr />


                {allproducts.map((product, index) => {
                    return <>
                        <div key={index} className=" l  listproduct-format">
                            <img className="listproduct-product-icon" src={product.image} alt="" />
                            <p className="title">{product.name}</p>
                            <p>${product.old_price}</p>
                            <p>${product.new_price}</p>
                            <p>{product.category}</p>
                            <img onClick={() => {
                                remove_product(product.id)
                            }} className="listproduct-remove-icon" src={cross_icon} alt="" />

                        </div>
                        <hr />
                    </>



                })}
            </div>

        </div>

    )

}
export default Listproduct