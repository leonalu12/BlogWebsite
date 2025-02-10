package pccit.finalproject.javaclient.model;

public class User {
    private int id;
    private String username;
    private String avatarUrl;

    public User(int id, String username, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.avatarUrl = avatarUrl;
    }

    public int getId() { return id; }
    public String getUsername() { return username; }
    public String getAvatarUrl() { return avatarUrl; }
}