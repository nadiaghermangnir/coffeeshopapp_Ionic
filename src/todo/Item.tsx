import React, {useState} from 'react';
import {ItemProps} from "./ItemProps";
import {IonButton, IonItem, IonLabel} from "@ionic/react";
import {Modal} from "../animations/Modal";


interface ItemPropsExt extends ItemProps {
    onEdit: (_id?: string) => void;
}

const Coffee: React.FC<ItemPropsExt> = ({ _id, name, quantity, available, withCaffeine, imgPath,  onEdit }) => {
    const [showModal, setShowModal] = useState(false);
    return (
         <IonItem>
            <IonLabel onClick={() => onEdit(_id)} color="primary"> {name} {quantity}ml</IonLabel>
             <IonButton onClick={() => {setShowModal(true); console.log("button clicked")}}>Coffee details</IonButton>
             <Modal open={showModal} name={name} quantity={quantity} withCaffeine={withCaffeine} showModal={setShowModal}/>
             <img src = {imgPath} style = {{height:50}} alt = "no image"/>
         </IonItem>
    );
};

export default Coffee;
