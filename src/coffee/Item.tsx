import React from 'react';
import {ItemProps} from "./ItemProps";
import {IonItem, IonLabel} from "@ionic/react";
//import { ItemProps.tsx } from './itemProvider';

interface ItemPropsExt extends ItemProps {
    onEdit: (id?: string) => void;
}

const Coffee: React.FC<ItemPropsExt> = ({ id, name, quantity, withCaffeine,  onEdit }) => {

    return (
         <IonItem onClick={() => onEdit(id)}>
            <IonLabel color="primary"> {name} {quantity}ml {withCaffeine}</IonLabel>
         </IonItem>
    );
};

export default Coffee;
