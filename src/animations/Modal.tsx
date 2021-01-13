import React, {useEffect, useState} from 'react';
import {createAnimation, IonModal, IonButton, IonContent} from '@ionic/react';
import '../style.css';

export const Modal: (props: { open: boolean, name: string, quantity: number, withCaffeine: boolean, showModal: any })
    => JSX.Element = (props: { open: boolean, name: string, quantity: number, withCaffeine: boolean, showModal: any }) => {
    const [showModal, setShowModal] = useState(props.open);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.0', '0.4');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                {offset: 0, opacity: '0', transform: 'scale(0)'},
                {offset: 1, opacity: '0.99', transform: 'scale(1)'}
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonModal isOpen={props.open} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation} cssClass = 'modal'>
                <div>
                    <p>name is {props.name}</p>
                    <p>quantity is {props.quantity}</p>
                    <p>{props.withCaffeine}</p>
                </div>
                <IonButton onClick={() => props.showModal(false)}>Close</IonButton>
            </IonModal>

        </>
    );
};