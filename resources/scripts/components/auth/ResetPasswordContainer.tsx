import React, { useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { parse } from 'query-string';
import { Link } from 'react-router-dom';
import performPasswordReset from '@/api/auth/performPasswordReset';
import { httpErrorToHuman } from '@/api/http';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { Actions, useStoreActions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import Spinner from '@/components/elements/Spinner';
import { Formik, FormikHelpers } from 'formik';
import { object, ref, string } from 'yup';
import Field from '@/components/elements/Field';

type Props = Readonly<RouteComponentProps<{ token: string }> & {}>;

interface Values {
    password: string;
    passwordConfirmation: string;
}

export default ({ match, history, location }: Props) => {
    const [ email, setEmail ] = useState('');

    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const parsed = parse(location.search);
    if (email.length === 0 && parsed.email) {
        setEmail(parsed.email as string);
    }

    const submit = ({ password, passwordConfirmation }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();
        performPasswordReset(email, { token: match.params.token, password, passwordConfirmation })
            .then(() => {
                // @ts-ignore
                window.location = '/';
            })
            .catch(error => {
                console.error(error);

                setSubmitting(false);
                addFlash({ type: 'error', title: 'Error', message: httpErrorToHuman(error) });
            });
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                password: '',
                passwordConfirmation: '',
            }}
            validationSchema={object().shape({
                password: string().required('A new password is required.')
                    .min(8, 'Your new password should be at least 8 characters in length.'),
                passwordConfirmation: string()
                    .required('Your new password does not match.')
                    .oneOf([ref('password'), null], 'Your new password does not match.'),
            })}
        >
            {({ isSubmitting }) => (
                <LoginFormContainer
                    title={'Reset Password'}
                    className={'w-full flex'}
                >
                    <div>
                        <label>Email</label>
                        <input className={'input'} value={email} disabled={true}/>
                    </div>
                    <div className={'mt-6'}>
                        <Field
                            light={true}
                            label={'New Password'}
                            name={'password'}
                            type={'password'}
                            description={'Passwords must be at least 8 characters in length.'}
                        />
                    </div>
                    <div className={'mt-6'}>
                        <Field
                            light={true}
                            label={'Confirm New Password'}
                            name={'passwordConfirmation'}
                            type={'password'}
                        />
                    </div>
                    <div className={'mt-6'}>
                        <button
                            type={'submit'}
                            className={'btn btn-primary btn-jumbo'}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ?
                                <Spinner size={'tiny'} className={'mx-auto'}/>
                                :
                                'Reset Password'
                            }
                        </button>
                    </div>
                    <div className={'mt-6 text-center'}>
                        <Link
                            to={'/auth/login'}
                            className={'text-xs text-neutral-500 tracking-wide no-underline uppercase hover:text-neutral-600'}
                        >
                            Return to Login
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};
