package pccit.finalproject.javaclient.utils;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class HttpClient {
    public static String sendPostRequest(String endpoint, String jsonPayload) throws IOException {
        URL url = new URL("http://localhost:3000" + endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        OutputStream os = conn.getOutputStream();
        os.write(jsonPayload.getBytes());
        os.flush();
        os.close();

        BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();
        return response.toString();
    }
}
