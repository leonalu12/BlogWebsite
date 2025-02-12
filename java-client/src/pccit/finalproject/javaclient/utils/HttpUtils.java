package pccit.finalproject.javaclient.utils;

import pccit.finalproject.javaclient.model.User;
import pccit.finalproject.javaclient.model.UserTableModel;

import javax.imageio.ImageIO;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.InputStream;
import java.io.StringReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;

public class HttpUtils {
    private static final String BASE_URL = "http://localhost:3000";
    private static final HttpClient client = HttpClient.newBuilder()
            .version(HttpClient.Version.HTTP_2)
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public static String sendPostRequestWithBody(String endpoint, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .method("POST", HttpRequest.BodyPublishers.ofString(jsonBody))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    public static String sendDeleteRequestWithBody(String endpoint, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .method("DELETE", HttpRequest.BodyPublishers.ofString(jsonBody))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    public static String sendGetRequestWithBody(String endpoint, String jsonBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + endpoint))
                .header("Content-Type", "application/json")
                .method("GET", HttpRequest.BodyPublishers.ofString(jsonBody))
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());
        System.out.println(response.body());
        return response.body();
    }

    // Fetch all user data, using SwingWorker to execute in the background
    public static SwingWorker<List<User>, Void> fetchUsersInBackground() {
        return new SwingWorker<>() {
            @Override
            protected List<User> doInBackground() throws Exception {
                List<User> users = new ArrayList<>();
                try {
                    String response = sendGetRequestWithBody("/api/admins", "");
                    JsonReader jsonReader = Json.createReader(new StringReader(response));
                    JsonArray jsonArray = jsonReader.readArray();
                    for (JsonObject jsonObject : jsonArray.getValuesAs(JsonObject.class)) {
                        User user = new User();
                        user.setId(jsonObject.getInt("id"));
                        user.setUsername(jsonObject.getString("username"));
                        user.setFname(jsonObject.getString("fname"));
                        user.setLname(jsonObject.getString("lname"));
                        user.setDescription(jsonObject.getString("description"));
                        user.setIcon(jsonObject.getString("icon"));
                        user.setPwd(jsonObject.getString("pwd"));
                        users.add(user);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
                return users;
            }

            @Override
            protected void done() {
                try {
                    List<User> users = get();
                    JTable table = new JTable();
                    // Use the fetched user list and update the UI here
                    UserTableModel userTableModel = new UserTableModel(users);
                    table.setModel(userTableModel);
                } catch (InterruptedException | ExecutionException e) {
                    e.printStackTrace();
                }
            }
        };
    }

    // Fetch user avatar
    public static ImageIcon getUserIcon(User user) {
        ImageIcon icon = null;
        try {
            String iconPath = user.getIcon();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("http://localhost:3000/images/" + iconPath))
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<InputStream> response = client.send(request, HttpResponse.BodyHandlers.ofInputStream());

            if (response.statusCode() == 200) {
                Image image = ImageIO.read(response.body());

                // Ensure the image is not null
                if (image != null) {
                    // Resize to 50x50
                    Image scaledImage = image.getScaledInstance(50, 50, Image.SCALE_SMOOTH);

                    // Create BufferedImage
                    BufferedImage bufferedImage = new BufferedImage(50, 50, BufferedImage.TYPE_INT_ARGB);
                    Graphics2D g2 = bufferedImage.createGraphics();

                    // Enable anti-aliasing
                    g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                    // Draw a circular clipping area
                    g2.setClip(new java.awt.geom.Ellipse2D.Float(0, 0, 50, 50));
                    g2.drawImage(scaledImage, 0, 0, null);
                    g2.dispose();

                    // Use the processed BufferedImage
                    icon = new ImageIcon(bufferedImage);
                }
            } else {
                System.err.println("Failed to fetch user icon: " + response.statusCode());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return icon;
    }

    public static String deleteUserFromBackend(int userId) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(BASE_URL + "/api/admins/" + userId))
                .header("Content-Type", "application/json")
                .method("DELETE", HttpRequest.BodyPublishers.noBody())
                .timeout(Duration.ofSeconds(10))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }
}
