import { useState, useEffect } from "react";
import { gardenService } from "../services/gardenService";
import toast from "react-hot-toast";

const GardenList = () => {
  const [gardens, setGardens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGardens = async () => {
      try {
        setLoading(true);
        console.log("GardenList: Fetching gardens...");

        const response = await gardenService.getGardens({
          page: 1,
          limit: 10,
          search: "",
        });

        console.log("GardenList: Response received:", response);

        // Handle the correct backend format: { HttpCode, success, data: { items: [...] } }
        let gardensData = [];

        if (
          response &&
          response.data &&
          response.data.items &&
          Array.isArray(response.data.items)
        ) {
          console.log("GardenList: Found gardens in response.data.items");
          gardensData = response.data.items;
        } else {
          console.log("GardenList: No gardens found in expected format");
          gardensData = [];
        }

        console.log("GardenList: Setting gardens:", gardensData);
        setGardens(gardensData);
      } catch (error) {
        console.error("GardenList: Error fetching gardens:", error);
        toast.error("Lỗi khi tải danh sách vườn: " + error.message);
        setGardens([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGardens();
  }, []);

  if (loading) {
    return (
      <div style={{ color: "#e0e0e0", padding: "20px" }}>
        Đang tải danh sách vườn...
      </div>
    );
  }

  return (
    <div style={{ color: "#e0e0e0", padding: "20px" }}>
      <h2 style={{ color: "#4cbe00", marginBottom: "20px" }}>
        🌱 Danh sách vườn
      </h2>

      <div style={{ marginBottom: "20px" }}>
        <strong>Số lượng vườn:</strong> {gardens.length}
      </div>

      {gardens.length > 0 ? (
        <div>
          {gardens.map((garden) => (
            <div
              key={garden.id}
              style={{
                backgroundColor: "#1a2e1a",
                border: "1px solid #28392e",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {garden.name}
              </div>
              <div style={{ fontSize: "12px", color: "#a0a0a0" }}>
                ID: {garden.id} | Owner ID: {garden.ownerId}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ color: "#a0a0a0" }}>Không có vườn nào được tìm thấy.</div>
      )}
    </div>
  );
};

export default GardenList;
