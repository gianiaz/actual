// @ts-strict-ignore
import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { ButtonWithLoading } from '@actual-app/components/button';
import { InitialFocus } from '@actual-app/components/initial-focus';
import { Input } from '@actual-app/components/input';
import { Text } from '@actual-app/components/text';
import { View } from '@actual-app/components/view';
import { theme } from '@actual-app/components/theme';

import { send } from 'loot-core/platform/client/fetch';
import { getSecretsError } from 'loot-core/shared/errors';

import { Error } from '@desktop-client/components/alerts';
import { Link } from '@desktop-client/components/common/Link';
import {
  Modal,
  ModalButtons,
  ModalCloseButton,
  ModalHeader,
} from '@desktop-client/components/common/Modal';
import { FormField, FormLabel } from '@desktop-client/components/forms';
import { type Modal as ModalType } from '@desktop-client/modals/modalsSlice';

type EnableBankingInitialiseModalProps = Extract<
  ModalType,
  { name: 'enablebanking-init' }
>['options'];

export const EnableBankingInitialiseModal = ({
  onSuccess,
}: EnableBankingInitialiseModalProps) => {
  const { t } = useTranslation();
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(
    t('It is required to provide both the secret id and secret key.'),
  );

  const onSubmit = async (close: () => void) => {
    if (!secretId || !secretKey) {
      setIsValid(false);
      setError(
        t('It is required to provide both the secret id and secret key.'),
      );
      return;
    }

    setIsLoading(true);

    let { error, reason } =
      (await send('secret-set', {
        name: 'enableBanking_secretId',
        value: secretId,
      })) || {};

    if (error) {
      setIsLoading(false);
      setIsValid(false);
      setError(getSecretsError(error, reason));
      return;
    } else {
      ({ error, reason } =
        (await send('secret-set', {
          name: 'enableBanking_secretKey',
          value: secretKey,
        })) || {});
      if (error) {
        setIsLoading(false);
        setIsValid(false);
        setError(getSecretsError(error, reason));
        return;
      }
    }

    setIsValid(true);
    onSuccess();
    setIsLoading(false);
    close();
  };

  return (
    <Modal name="enablebanking-init" containerProps={{ style: { width: '30vw' } }}>
      {({ state: { close } }) => (
        <>
          <ModalHeader
            title={t('Set up EnableBanking')}
            rightContent={<ModalCloseButton onPress={close} />}
          />
          <View style={{ display: 'flex', gap: 10 }}>
            <Text>
              <Trans>
                In order to enable bank sync via EnableBanking
                you will need to create access credentials. This can be done by
                creating an account with{' '}
                <Link
                  variant="external"
                  to="https://actualbudget.org/docs/advanced/bank-sync/"
                  linkColor="purple"
                >
                  GoCardless
                </Link>
                .
              </Trans>
            </Text>

            <FormField>
              <FormLabel title={t('Secret ID:')} htmlFor="enablebanking-secret-id-field" />
              <InitialFocus>
                <Input
                  id="enablebanking-secret-id-field"
                  type="password"
                  value={secretId}
                  onChangeValue={value => {
                    setSecretId(value);
                    setIsValid(true);
                  }}
                />
              </InitialFocus>
            </FormField>

            <FormField>
              <FormLabel title={t('Secret Key:')} htmlFor="enablebanking-secret-key-field" />
              <textarea
                id="enablebanking-secret-key-field"
                value={secretKey}
                onChange={e => {
                  setSecretKey(e.target.value);
                  setIsValid(true);
                }}
                style={{
                  outline: 0,
                  backgroundColor: theme.tableBackground,
                  color: theme.formInputText,
                  margin: 0,
                  padding: 5,
                  borderRadius: 4,
                  border: '1px solid ' + theme.formInputBorder,
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  minHeight: 120,
                  width: '100%',
                  resize: 'vertical',
                }}
              />
            </FormField>

            {!isValid && <Error>{error}</Error>}
          </View>

          <ModalButtons>
            <ButtonWithLoading
              variant="primary"
              isLoading={isLoading}
              onPress={() => {
                onSubmit(close);
              }}
            >
              <Trans>Save and continue</Trans>
            </ButtonWithLoading>
          </ModalButtons>
        </>
      )}
    </Modal>
  );
};
