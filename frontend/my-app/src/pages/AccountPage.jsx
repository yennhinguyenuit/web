import { useEffect, useState } from 'react';
import { accountAPI } from '../services/api';

const EMPTY_ADDRESS = {
  name: '',
  phone: '',
  address: '',
  city: '',
  district: '',
  ward: '',
  isDefault: false,
};

function AccountPage() {
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', defaultAddress: '' });
  const [addressForm, setAddressForm] = useState(EMPTY_ADDRESS);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, addressRes] = await Promise.all([
        accountAPI.getProfile(),
        accountAPI.getAddresses(),
      ]);

      setProfile(profileRes.data);
      setAddresses(addressRes.data || []);
      setProfileForm({
        name: profileRes.data?.name || '',
        phone: profileRes.data?.phone || '',
        defaultAddress: profileRes.data?.defaultAddress || '',
      });
    } catch (error) {
      console.error(error);
      alert(error.message || 'Không thể tải thông tin tài khoản');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      const res = await accountAPI.updateProfile(profileForm);
      setProfile(res.data);
      alert(res.message || 'Đã cập nhật tài khoản');
    } catch (error) {
      alert(error.message || 'Không thể cập nhật tài khoản');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    setSavingAddress(true);
    try {
      await accountAPI.createAddress(addressForm);
      setAddressForm(EMPTY_ADDRESS);
      await loadData();
      alert('Đã thêm địa chỉ');
    } catch (error) {
      alert(error.message || 'Không thể thêm địa chỉ');
    } finally {
      setSavingAddress(false);
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await accountAPI.updateAddress(addressId, { isDefault: true });
      await loadData();
    } catch (error) {
      alert(error.message || 'Không thể đặt địa chỉ mặc định');
    }
  };

  const removeAddress = async (addressId) => {
    try {
      await accountAPI.deleteAddress(addressId);
      await loadData();
    } catch (error) {
      alert(error.message || 'Không thể xóa địa chỉ');
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải tài khoản...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-3">Tài khoản của bạn</h1>
        {profile ? (
          <div className="bg-white rounded shadow p-4 space-y-1">
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Vai trò:</strong> {profile.role}</p>
            <p><strong>Ngày tạo:</strong> {new Date(profile.createdAt).toLocaleString()}</p>
          </div>
        ) : null}
      </div>

      <form onSubmit={handleProfileSubmit} className="bg-white rounded shadow p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Cập nhật hồ sơ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            value={profileForm.name}
            onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
            className="border rounded px-4 py-3"
            placeholder="Họ tên"
          />
          <input
            value={profileForm.phone}
            onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))}
            className="border rounded px-4 py-3"
            placeholder="Số điện thoại"
          />
        </div>
        <input
          value={profileForm.defaultAddress}
          onChange={(event) => setProfileForm((current) => ({ ...current, defaultAddress: event.target.value }))}
          className="border rounded px-4 py-3 w-full"
          placeholder="Địa chỉ mặc định dạng text"
        />
        <button disabled={savingProfile} className="px-5 py-2 bg-red-600 text-white rounded disabled:opacity-60">
          {savingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
        </button>
      </form>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Địa chỉ đã lưu</h2>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="border rounded p-4 space-y-2">
                <p className="font-semibold">{address.name} {address.isDefault ? '(Mặc định)' : ''}</p>
                <p>{address.phone}</p>
                <p>{address.address}, {address.ward}, {address.district}, {address.city}</p>
                <div className="flex gap-3">
                  {!address.isDefault ? (
                    <button onClick={() => setDefaultAddress(address.id)} className="text-red-600 font-medium">
                      Đặt mặc định
                    </button>
                  ) : null}
                  <button onClick={() => removeAddress(address.id)} className="text-gray-600 font-medium">
                    Xóa
                  </button>
                </div>
              </div>
            ))}
            {addresses.length === 0 ? <p>Chưa có địa chỉ nào.</p> : null}
          </div>
        </div>

        <form onSubmit={handleAddressSubmit} className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-2xl font-semibold">Thêm địa chỉ mới</h2>
          <input value={addressForm.name} onChange={(event) => setAddressForm((current) => ({ ...current, name: event.target.value }))} className="border rounded px-4 py-3 w-full" placeholder="Tên người nhận" required />
          <input value={addressForm.phone} onChange={(event) => setAddressForm((current) => ({ ...current, phone: event.target.value }))} className="border rounded px-4 py-3 w-full" placeholder="Số điện thoại" required />
          <input value={addressForm.address} onChange={(event) => setAddressForm((current) => ({ ...current, address: event.target.value }))} className="border rounded px-4 py-3 w-full" placeholder="Số nhà, đường" required />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input value={addressForm.ward} onChange={(event) => setAddressForm((current) => ({ ...current, ward: event.target.value }))} className="border rounded px-4 py-3" placeholder="Phường/Xã" required />
            <input value={addressForm.district} onChange={(event) => setAddressForm((current) => ({ ...current, district: event.target.value }))} className="border rounded px-4 py-3" placeholder="Quận/Huyện" required />
            <input value={addressForm.city} onChange={(event) => setAddressForm((current) => ({ ...current, city: event.target.value }))} className="border rounded px-4 py-3" placeholder="Tỉnh/Thành phố" required />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={addressForm.isDefault} onChange={(event) => setAddressForm((current) => ({ ...current, isDefault: event.target.checked }))} />
            Đặt làm mặc định
          </label>
          <button disabled={savingAddress} className="px-5 py-2 bg-red-600 text-white rounded disabled:opacity-60">
            {savingAddress ? 'Đang thêm...' : 'Thêm địa chỉ'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AccountPage;
