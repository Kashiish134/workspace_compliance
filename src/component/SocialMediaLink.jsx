import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

function SocialMediaLink() {
  return (
    <>
      <Row className="mb-3">
        <Form.Label column="sm" lg={2}>
        Facebook
        </Form.Label>
        <Col>
          <Form.Control type="text" placeholder="Enter Facebook Link" />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Form.Label column="sm" lg={2}>
        Twitter
        </Form.Label>
        <Col>
          <Form.Control type="text" placeholder="Enter Facebook Link" />
        </Col>
      </Row>
      
      <Row className="mb-3">
        <Form.Label column="sm" lg={2}>
        LinkedIn
        </Form.Label>
        <Col>
          <Form.Control size="sm" type="text" placeholder="Enter Facebook Link" />
        </Col>
      </Row>
      <Row className="mb-3">
        <Form.Label column="sm" lg={2}>
        Instagram
        </Form.Label>
        <Col>
          <Form.Control size="sm" type="text" placeholder="Enter Facebook Link" />
        </Col>
      </Row>
    </>
  );
}

export default SocialMediaLink;
