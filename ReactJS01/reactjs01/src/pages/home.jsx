// ...existing code...
import { CrownOutlined } from '@ant-design/icons';
import { Result } from 'antd';
import ProductList from '../components/ProductList';

const HomePage = () => {
  return (
    <div style={{ padding: 20 }}>
      <Result
        icon={<CrownOutlined />}
        title="JSON Web Token (React/Node.JS) - iotstar.vn"
      />

      <div style={{ marginTop: 20 }}>
        <h3>Sản phẩm</h3>
        <ProductList category="all" pageSize={8} />
      </div>
    </div>
  );
}

export default HomePage;
// ...existing code...