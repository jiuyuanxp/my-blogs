package com.blog.config;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Jackson 全局配置：时间格式统一为 yyyy-MM-dd HH:mm:ss。
 * 符合 docs/api-contract.md 约定。
 */
@Configuration
public class JacksonConfig {

    public static final String DATETIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    public static final DateTimeFormatter DATETIME_FORMATTER =
            DateTimeFormatter.ofPattern(DATETIME_PATTERN);

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jackson2ObjectMapperBuilderCustomizer() {
        return builder -> {
            builder.serializerByType(
                    LocalDateTime.class,
                    new JsonSerializer<LocalDateTime>() {
                        @Override
                        public void serialize(
                                LocalDateTime value,
                                JsonGenerator gen,
                                SerializerProvider serializers)
                                throws IOException {
                            gen.writeString(value.format(DATETIME_FORMATTER));
                        }
                    });
            builder.deserializerByType(
                    LocalDateTime.class,
                    new JsonDeserializer<LocalDateTime>() {
                        @Override
                        public LocalDateTime deserialize(
                                JsonParser p, DeserializationContext ctxt) throws IOException {
                            return LocalDateTime.parse(p.getValueAsString(), DATETIME_FORMATTER);
                        }
                    });
        };
    }
}
