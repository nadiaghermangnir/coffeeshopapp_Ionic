import React from 'react';
import {ItemProps} from "./ItemProps";
import {IonItem, IonLabel} from "@ionic/react";


interface ItemPropsExt extends ItemProps {
    onEdit: (_id?: string) => void;
}

const Coffee: React.FC<ItemPropsExt> = ({ _id, name, quantity, available, withCaffeine,  onEdit }) => {

    return (
         <IonItem onClick={() => onEdit(_id)}>
            <IonLabel color="primary"> {name} {quantity}ml {available} {withCaffeine}</IonLabel>
         </IonItem>
    );
};

export default Coffee;
