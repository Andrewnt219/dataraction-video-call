import React, { useState } from 'react';
import {
  Button,
  Container,
  Form,
  FormGroup,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap';
import { useAgoraHandlers } from '_hooks/agora/useAgoraHandlers';
import AgoraAudioSelect from './AgoraAudioSelect.tsx/AgoraAudioSelect';
import AgoraVideoSelect from './AgoraVideoSelect/AgoraVideoSelect';
const AgoraDeviceTestModal = () => {
  const { publishTracks } = useAgoraHandlers();

  const [isOpen, setIsOpen] = useState(true);

  const handleFinishButtonClick = () => {
    publishTracks();
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <Modal isOpen={isOpen} onClosed={handleClose}>
      <ModalHeader>Media Device Test</ModalHeader>

      <ModalBody>
        <Container>
          <Form>
            <FormGroup>
              <h5>Microphone</h5>

              <p>Produce sounds to check if the mic works.</p>

              <AgoraAudioSelect />
            </FormGroup>

            <FormGroup>
              <h5>Camera</h5>

              <p>Move in front of the camera to check if it works.</p>

              <AgoraVideoSelect />
            </FormGroup>
          </Form>
        </Container>
      </ModalBody>

      <ModalFooter>
        <Button color="primary" onClick={handleFinishButtonClick}>
          Finish
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AgoraDeviceTestModal;
