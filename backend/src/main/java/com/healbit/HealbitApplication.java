package com.healbit;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@EnableAsync
@EnableScheduling
@SpringBootApplication
public class HealbitApplication {

	@Value("${healbit.timezone:Asia/Kolkata}")
	private String timezone;

	/**
	 * Appointment dates/times are stored as local values, so the JVM must agree with the
	 * clinic's clock. Without this, a server running in UTC would judge "today" and
	 * "already passed" incorrectly for Indian users.
	 */
	@PostConstruct
	public void applyTimezone() {
		TimeZone.setDefault(TimeZone.getTimeZone(timezone));
	}

	public static void main(String[] args) {
		SpringApplication.run(HealbitApplication.class, args);
	}

}
